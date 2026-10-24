"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "./vault";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// =========================================================================
// 1. GENERAL NEW TRANSACTION (DEPOSIT / WITHDRAW / SPEND / BILL PAY)
// =========================================================================
const TransactionInputSchema = z.object({
  type: z.enum(["Deposit", "Withdraw", "DEPOSIT", "WITHDRAW"]),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().min(1, "Please select an account"),
  category: z.string().min(1, "Please select a category"),
  date: z.string().optional(),
  description: z.string().optional().default(""),
});

export async function createNewTransactionAction(formData: {
  type: "Deposit" | "Withdraw";
  amount: number;
  accountId: string; // "bank:id" or "cash:id" or "card:id" or raw id
  category: string;
  date?: string;
  description?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const validated = TransactionInputSchema.parse(formData);
    const dateObj = validated.date ? new Date(validated.date) : new Date();
    const isDeposit = validated.type === "Deposit" || validated.type === "DEPOSIT";

    let targetType = "bank";
    let realAccountId = validated.accountId;

    if (validated.accountId.includes(":")) {
      const parts = validated.accountId.split(":");
      targetType = parts[0];
      realAccountId = parts[1];
    } else {
      // detect by existence
      const isBank = await prisma.bankAccount.findUnique({ where: { id: validated.accountId } });
      if (isBank) targetType = "bank";
      else {
        const isCash = await prisma.physicalAsset.findUnique({ where: { id: validated.accountId } });
        if (isCash) targetType = "cash";
        else {
          const isCard = await prisma.creditCard.findUnique({ where: { id: validated.accountId } });
          if (isCard) targetType = "card";
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let bankAccountId: string | null = null;
      let creditCardId: string | null = null;
      let physicalAssetId: string | null = null;
      let transactionType = isDeposit ? "DEPOSIT" : "WITHDRAW";

      if (targetType === "bank") {
        bankAccountId = realAccountId;
        const bank = await tx.bankAccount.findUnique({
          where: { id: realAccountId, userId },
        });
        if (!bank) throw new Error("Bank account not found");

        if (!isDeposit && bank.balance < validated.amount) {
          throw new Error("Insufficient funds in bank account");
        }

        await tx.bankAccount.update({
          where: { id: realAccountId },
          data: {
            balance: isDeposit
              ? { increment: validated.amount }
              : { decrement: validated.amount },
          },
        });
      } else if (targetType === "cash") {
        physicalAssetId = realAccountId;
        const asset = await tx.physicalAsset.findUnique({
          where: { id: realAccountId, userId },
        });
        if (!asset) throw new Error("Physical cash record not found");

        if (!isDeposit && asset.currentBalance < validated.amount) {
          throw new Error("Insufficient cash in locker / wallet");
        }

        await tx.physicalAsset.update({
          where: { id: realAccountId },
          data: {
            currentBalance: isDeposit
              ? { increment: validated.amount }
              : { decrement: validated.amount },
          },
        });
      } else if (targetType === "card") {
        creditCardId = realAccountId;
        const card = await tx.creditCard.findUnique({
          where: { id: realAccountId, userId },
        });
        if (!card) throw new Error("Credit card not found");

        if (isDeposit) {
          // Bill payment reduces outstanding and restores available balance
          transactionType = "CARD_BILL_PAY";
          await tx.creditCard.update({
            where: { id: realAccountId },
            data: {
              totalOutstanding: { decrement: Math.min(card.totalOutstanding, validated.amount) },
              availableBalance: { increment: validated.amount },
            },
          });
          if (card.isSharedLimit && card.parentCardId) {
            await tx.creditCard.update({
              where: { id: card.parentCardId },
              data: {
                availableBalance: { increment: validated.amount },
              },
            });
          }
        } else {
          // Spend on credit card increases outstanding and reduces available balance
          transactionType = "CARD_SPEND";
          if (card.availableBalance < validated.amount) {
            throw new Error("Transaction exceeds available card credit limit");
          }
          await tx.creditCard.update({
            where: { id: realAccountId },
            data: {
              totalOutstanding: { increment: validated.amount },
              availableBalance: { decrement: validated.amount },
            },
          });
          if (card.isSharedLimit && card.parentCardId) {
            await tx.creditCard.update({
              where: { id: card.parentCardId },
              data: {
                availableBalance: { decrement: validated.amount },
              },
            });
          }
        }
      }

      const txRecord = await tx.transaction.create({
        data: {
          userId,
          type: transactionType,
          amount: validated.amount,
          category: validated.category,
          description: validated.description || `${transactionType} via ${targetType}`,
          bankAccountId,
          creditCardId,
          physicalAssetId,
          date: dateObj,
        },
      });

      return txRecord;
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message || "Failed to execute transaction" };
  }
}

// =========================================================================
// 2. P2P LEDGER TRANSACTION (PAY / RECEIVE)
// =========================================================================
export async function createP2PLedgerTransactionAction(formData: {
  p2pContactId: string;
  mode: "PAY" | "RECEIVE"; // PAY = You gave; RECEIVE = You got
  amount: number;
  sourceType: "Physical Cash" | "Bank Account" | "Gift Card";
  sourceAccountId?: string;
  date?: string;
  remarks?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    if (formData.amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const dateObj = formData.date ? new Date(formData.date) : new Date();
    const isPay = formData.mode === "PAY";

    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.p2PContact.findUnique({
        where: { id: formData.p2pContactId, userId },
      });
      if (!contact) throw new Error("P2P Contact not found");

      let bankAccountId: string | null = null;
      let physicalAssetId: string | null = null;
      let giftCardId: string | null = null;

      // Adjust the source/destination balance
      if (formData.sourceType === "Bank Account") {
        let bank = formData.sourceAccountId
          ? await tx.bankAccount.findUnique({ where: { id: formData.sourceAccountId, userId } })
          : await tx.bankAccount.findFirst({ where: { userId } });

        if (!bank) throw new Error("No Bank Account available for P2P transaction");
        bankAccountId = bank.id;

        if (isPay && bank.balance < formData.amount) {
          throw new Error("Insufficient balance in bank account to send payment");
        }

        await tx.bankAccount.update({
          where: { id: bank.id },
          data: {
            balance: isPay
              ? { decrement: formData.amount }
              : { increment: formData.amount },
          },
        });
      } else if (formData.sourceType === "Physical Cash") {
        let cash = formData.sourceAccountId
          ? await tx.physicalAsset.findUnique({ where: { id: formData.sourceAccountId, userId } })
          : await tx.physicalAsset.findFirst({ where: { userId } });

        if (!cash) {
          // create default cash wallet if none exists
          cash = await tx.physicalAsset.create({
            data: {
              userId,
              storageName: "Home Safe",
              holderName: contact.name,
              currentBalance: 0,
            },
          });
        }
        physicalAssetId = cash.id;

        if (isPay && cash.currentBalance < formData.amount) {
          throw new Error("Insufficient cash in locker / safe to send payment");
        }

        await tx.physicalAsset.update({
          where: { id: cash.id },
          data: {
            currentBalance: isPay
              ? { decrement: formData.amount }
              : { increment: formData.amount },
          },
        });
      } else if (formData.sourceType === "Gift Card") {
        let card = formData.sourceAccountId
          ? await tx.giftCard.findUnique({ where: { id: formData.sourceAccountId, userId } })
          : await tx.giftCard.findFirst({ where: { userId } });

        if (!card) throw new Error("No Gift Card available for P2P transaction");
        giftCardId = card.id;

        if (isPay && card.balance < formData.amount) {
          throw new Error("Insufficient gift card balance");
        }

        await tx.giftCard.update({
          where: { id: card.id },
          data: {
            balance: isPay
              ? { decrement: formData.amount }
              : { increment: formData.amount },
          },
        });
      }

      // Net Balance formula:
      // Positive = They Owe You (Receivable)
      // Negative = You Owe Them (Payable)
      // If PAY (You Gave): they now owe you MORE (or you owe them LESS) -> increment netBalance
      // If RECEIVE (You Got): they now owe you LESS (or you owe them MORE) -> decrement netBalance
      const netBalanceDelta = isPay ? formData.amount : -formData.amount;

      const updatedContact = await tx.p2PContact.update({
        where: { id: formData.p2pContactId },
        data: {
          netBalance: { increment: netBalanceDelta },
        },
      });

      // Record in p2p_transactions table
      const p2pTx = await tx.p2PTransaction.create({
        data: {
          p2pAccountId: contact.id,
          type: isPay ? "PAID_TO_CONTACT" : "RECEIVED_FROM_CONTACT",
          amount: formData.amount,
          destination: formData.sourceType,
          remarks: formData.remarks || (isPay ? `Paid to ${contact.name}` : `Received from ${contact.name}`),
          date: dateObj,
        },
      });

      // Record in unified transactions table
      const unifiedTx = await tx.transaction.create({
        data: {
          userId,
          type: isPay ? "P2P_PAY" : "P2P_RECEIVE",
          amount: formData.amount,
          category: "P2P Settlement",
          description: formData.remarks || (isPay ? `Paid ${contact.name}` : `Received from ${contact.name}`),
          bankAccountId,
          physicalAssetId,
          giftCardId,
          date: dateObj,
        },
      });

      return { contact: updatedContact, p2pTx, unifiedTx };
    });

    revalidatePath("/");
    revalidatePath("/reports");
    revalidatePath("/p2p");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error executing P2P transaction:", error);
    return { success: false, error: error.message || "Failed to record P2P transaction" };
  }
}

// =========================================================================
// 3. FILTERED TRANSACTIONS FOR REPORTS & STATEMENTS
// =========================================================================
export async function getFilteredTransactionsAction(filters: {
  query?: string;
  type?: string; // "All" | "Debit" | "Credit" | "Internal Transfer"
  category?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();

    const whereClause: any = { userId };

    if (filters.query && filters.query.trim() !== "") {
      whereClause.OR = [
        { description: { contains: filters.query, mode: "insensitive" } },
        { category: { contains: filters.query, mode: "insensitive" } },
      ];
    }

    if (filters.type && filters.type !== "All") {
      if (filters.type === "Debit") {
        whereClause.type = { in: ["WITHDRAW", "CARD_SPEND", "P2P_PAY"] };
      } else if (filters.type === "Credit") {
        whereClause.type = { in: ["DEPOSIT", "P2P_RECEIVE", "CARD_BILL_PAY", "GIFT_REDEEM"] };
      } else if (filters.type === "Internal Transfer") {
        whereClause.type = { in: ["TRANSFER"] };
      }
    }

    if (filters.category && filters.category !== "All Categories" && filters.category !== "All") {
      whereClause.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.date = {};
      if (filters.startDate) {
        whereClause.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    const items = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        bankAccount: true,
        creditCard: true,
        physicalAsset: true,
        giftCard: true,
      },
      orderBy: { date: "desc" },
    });

    let totalDebits = 0;
    let totalCredits = 0;

    const formattedList = items.map((t) => {
      const isDebit = ["WITHDRAW", "CARD_SPEND", "P2P_PAY"].includes(t.type);
      if (isDebit) {
        totalDebits += t.amount;
      } else {
        totalCredits += t.amount;
      }

      let accountName = "Vault General";
      if (t.bankAccount) accountName = `${t.bankAccount.bankName} (..${t.bankAccount.last4Digits})`;
      else if (t.creditCard) accountName = `${t.creditCard.cardName} (..${t.creditCard.last4Digits})`;
      else if (t.physicalAsset) accountName = `${t.physicalAsset.storageName}`;
      else if (t.giftCard) accountName = `${t.giftCard.brandName}`;

      return {
        id: t.id,
        date: t.date,
        description: t.description || t.category,
        amount: t.amount,
        type: t.type,
        category: t.category,
        accountName,
        isDebit,
      };
    });

    return {
      success: true,
      data: formattedList,
      summary: {
        totalDebits,
        totalCredits,
        count: formattedList.length,
      },
    };
  } catch (error: any) {
    console.error("Error fetching filtered transactions:", error);
    return { success: false, error: error.message || "Failed to load reports" };
  }
}

// =========================================================================
// 4. DELETE TRANSACTION
// =========================================================================
export async function deleteTransactionAction(transactionId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const txRecord = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!txRecord) {
      return { success: false, error: "Transaction not found" };
    }

    await prisma.$transaction(async (tx) => {
      // Revert account balances where appropriate
      if (txRecord.bankAccountId) {
        if (txRecord.type === "DEPOSIT") {
          await tx.bankAccount.update({
            where: { id: txRecord.bankAccountId },
            data: { balance: { decrement: txRecord.amount } },
          });
        } else if (txRecord.type === "WITHDRAW") {
          await tx.bankAccount.update({
            where: { id: txRecord.bankAccountId },
            data: { balance: { increment: txRecord.amount } },
          });
        }
      } else if (txRecord.physicalAssetId) {
        if (txRecord.type === "DEPOSIT") {
          await tx.physicalAsset.update({
            where: { id: txRecord.physicalAssetId },
            data: { currentBalance: { decrement: txRecord.amount } },
          });
        } else if (txRecord.type === "WITHDRAW") {
          await tx.physicalAsset.update({
            where: { id: txRecord.physicalAssetId },
            data: { currentBalance: { increment: txRecord.amount } },
          });
        }
      } else if (txRecord.creditCardId) {
        if (txRecord.type === "CARD_SPEND") {
          await tx.creditCard.update({
            where: { id: txRecord.creditCardId },
            data: {
              totalOutstanding: { decrement: txRecord.amount },
              availableBalance: { increment: txRecord.amount },
            },
          });
        } else if (txRecord.type === "CARD_BILL_PAY") {
          await tx.creditCard.update({
            where: { id: txRecord.creditCardId },
            data: {
              totalOutstanding: { increment: txRecord.amount },
              availableBalance: { decrement: txRecord.amount },
            },
          });
        }
      } else if (txRecord.giftCardId) {
        if (txRecord.type === "DEPOSIT") {
          await tx.giftCard.update({
            where: { id: txRecord.giftCardId },
            data: { balance: { decrement: txRecord.amount } },
          });
        }
      }

      await tx.transaction.delete({
        where: { id: transactionId },
      });
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message || "Failed to delete transaction" };
  }
}

