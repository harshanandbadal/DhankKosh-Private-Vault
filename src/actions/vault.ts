"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Helper to get authenticated user strictly from session
export async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED: Active session required to access private vault.");
  }
  return session.user.id;
}

// =========================================================================
// 1. BANK ACCOUNT
// =========================================================================
const BankAccountSchema = z.object({
  bankName: z.string().min(2, "Bank Name is required"),
  holderName: z.string().min(2, "Holder Name is required"),
  accountType: z.enum(["Savings", "Current", "Salary"]).default("Savings"),
  accountNumber: z.string().min(4, "Account Number is required"),
  last4Digits: z.string().length(4, "Must be 4 digits").optional(),
  initialBalance: z.number().min(0).default(0),
  ifscCode: z.string().optional().default(""),
  branch: z.string().optional().default(""),
});

export async function createBankAccountAction(formData: {
  bankName: string;
  holderName: string;
  accountType: string;
  accountNumber: string;
  last4Digits?: string;
  initialBalance: number;
  ifscCode?: string;
  branch?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const last4 = formData.last4Digits || formData.accountNumber.slice(-4);

    const validated = BankAccountSchema.parse({
      ...formData,
      last4Digits: last4,
    });

    const result = await prisma.$transaction(async (tx) => {
      const bank = await tx.bankAccount.create({
        data: {
          userId,
          bankName: validated.bankName,
          holderName: validated.holderName,
          accountType: validated.accountType,
          accountNumber: validated.accountNumber,
          last4Digits: validated.last4Digits || "0000",
          balance: validated.initialBalance,
          ifscCode: validated.ifscCode,
          branch: validated.branch,
        },
      });

      if (validated.initialBalance > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "DEPOSIT",
            amount: validated.initialBalance,
            category: "Opening Balance",
            description: `Initial deposit for ${validated.bankName} (${validated.accountType})`,
            bankAccountId: bank.id,
            date: new Date(),
          },
        });
      }

      return bank;
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating bank account:", error);
    return { success: false, error: error.message || "Failed to create bank account" };
  }
}

// Quick Deposit
export async function quickDepositAction(bankAccountId: string, amount: number, description?: string) {
  try {
    const userId = await getAuthenticatedUserId();
    if (amount <= 0) return { success: false, error: "Amount must be greater than 0" };

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.bankAccount.findUnique({
        where: { id: bankAccountId, userId },
      });
      if (!account) throw new Error("Bank account not found");

      const updatedAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { increment: amount } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          amount,
          category: "Quick Deposit",
          description: description || `Quick Deposit to ${account.bankName}`,
          bankAccountId,
          date: new Date(),
        },
      });

      return { account: updatedAccount, transaction: txRecord };
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to deposit" };
  }
}

// Quick Withdraw
export async function quickWithdrawAction(bankAccountId: string, amount: number, description?: string) {
  try {
    const userId = await getAuthenticatedUserId();
    if (amount <= 0) return { success: false, error: "Amount must be greater than 0" };

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.bankAccount.findUnique({
        where: { id: bankAccountId, userId },
      });
      if (!account) throw new Error("Bank account not found");
      if (account.balance < amount) throw new Error("Insufficient funds in bank account");

      const updatedAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: amount } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          userId,
          type: "WITHDRAW",
          amount,
          category: "Quick Withdraw",
          description: description || `Quick Withdraw from ${account.bankName}`,
          bankAccountId,
          date: new Date(),
        },
      });

      return { account: updatedAccount, transaction: txRecord };
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to withdraw" };
  }
}

// =========================================================================
// 2. CREDIT CARD
// =========================================================================
const CreditCardSchema = z.object({
  cardName: z.string().min(2, "Card Name is required"),
  holderName: z.string().min(2, "Holder Name is required"),
  last4Digits: z.string().length(4, "Must be exactly 4 digits"),
  creditLimit: z.number().min(0, "Credit Limit must be positive"),
  availableBalance: z.number().min(0),
  totalOutstanding: z.number().min(0),
  dueDateDay: z.number().min(1).max(31).default(15),
  theme: z.enum(["blue", "red", "gold", "orange", "purple", "GOLD", "BLUE", "RED", "ORANGE", "PURPLE"]).default("blue"),
  isSharedLimit: z.boolean().default(false),
  parentCardId: z.string().optional().nullable(),
});

export async function createCreditCardAction(formData: {
  cardName: string;
  holderName: string;
  last4Digits: string;
  creditLimit: number;
  availableBalance: number;
  totalOutstanding: number;
  dueDateDay: number;
  theme: string;
  isSharedLimit?: boolean;
  parentCardId?: string | null;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const validated = CreditCardSchema.parse(formData);

    const result = await prisma.$transaction(async (tx) => {
      // If shared limit with parent card, inherit or link parent limit
      let effectiveLimit = validated.creditLimit;
      let effectiveAvailable = validated.availableBalance;

      if (validated.isSharedLimit && validated.parentCardId) {
        const parent = await tx.creditCard.findUnique({
          where: { id: validated.parentCardId, userId },
        });
        if (parent) {
          effectiveLimit = parent.creditLimit;
          effectiveAvailable = Math.max(0, parent.availableBalance - validated.totalOutstanding);
        }
      }

      const card = await tx.creditCard.create({
        data: {
          userId,
          cardName: validated.cardName,
          holderName: validated.holderName,
          last4Digits: validated.last4Digits,
          creditLimit: effectiveLimit,
          availableBalance: effectiveAvailable,
          totalOutstanding: validated.totalOutstanding,
          dueDateDay: validated.dueDateDay,
          theme: validated.theme.toLowerCase(),
          isSharedLimit: !!validated.isSharedLimit,
          parentCardId: validated.parentCardId || null,
        },
      });

      return card;
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating credit card:", error);
    return { success: false, error: error.message || "Failed to create credit card" };
  }
}

// =========================================================================
// 3. PHYSICAL CASH / ASSET RECORD
// =========================================================================
export async function createPhysicalAssetAction(formData: {
  storageName: string;
  holderName: string;
  currentBalance: number;
  denominations?: Record<string, number> | string;
  locationDetails?: string;
  remarks?: string;
  assetType?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const denomsStr =
      typeof formData.denominations === "object"
        ? JSON.stringify(formData.denominations)
        : formData.denominations || "";

    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.physicalAsset.create({
        data: {
          userId,
          storageName: formData.storageName,
          holderName: formData.holderName || "Vault Owner",
          currentBalance: formData.currentBalance,
          denominations: denomsStr,
          locationDetails: formData.locationDetails || "",
          remarks: formData.remarks || "",
          assetType: formData.assetType || "CASH",
        },
      });

      if (formData.currentBalance > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "DEPOSIT",
            amount: formData.currentBalance,
            category: "Opening Cash",
            description: `Initial count in ${formData.storageName}`,
            physicalAssetId: asset.id,
            date: new Date(),
          },
        });
      }

      return asset;
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error adding physical asset:", error);
    return { success: false, error: error.message || "Failed to add physical asset" };
  }
}

// =========================================================================
// 4. P2P ACCOUNT
// =========================================================================
export async function createP2PContactAction(formData: {
  name: string;
  phone: string;
  initialStatus: "They Owe Me (To Receive)" | "I Owe Them (To Pay)" | "none";
  openingBalance: number;
  email?: string;
  group?: string;
  relationshipRemarks?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const isReceivable = formData.initialStatus === "They Owe Me (To Receive)";
    // Positive balance = They Owe You; Negative balance = You Owe Them
    const netBalance = isReceivable
      ? Math.abs(formData.openingBalance)
      : -Math.abs(formData.openingBalance);

    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.p2PContact.create({
        data: {
          userId,
          name: formData.name,
          phone: formData.phone || "",
          email: formData.email || "",
          initialStatus: formData.initialStatus,
          openingBalance: formData.openingBalance,
          netBalance,
          group: formData.group || "Friends",
          relationshipRemarks: formData.relationshipRemarks || "",
        },
      });

      if (formData.openingBalance > 0) {
        await tx.p2PTransaction.create({
          data: {
            p2pAccountId: contact.id,
            type: isReceivable ? "LENT" : "BORROWED",
            amount: formData.openingBalance,
            destination: "Initial Ledger Entry",
            remarks: `Initial Balance - ${formData.relationshipRemarks || "P2P Setup"}`,
            date: new Date(),
          },
        });
      }

      return contact;
    });

    revalidatePath("/");
    revalidatePath("/reports");
    revalidatePath("/p2p");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating P2P contact:", error);
    return { success: false, error: error.message || "Failed to create P2P record" };
  }
}

// =========================================================================
// 5. GIFT CARD RECORD
// =========================================================================
export async function createGiftCardAction(formData: {
  brandName: string;
  ownerName: string;
  cardNumber: string;
  last4Digits?: string;
  initialBalance: number;
  expiryDate?: string | Date;
  linkedAccountId?: string;
  purchaseMethod?: string;
  remarks?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const last4 = formData.last4Digits || formData.cardNumber.slice(-4);
    const exp = formData.expiryDate ? new Date(formData.expiryDate) : null;

    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.create({
        data: {
          userId,
          brandName: formData.brandName,
          ownerName: formData.ownerName || "Vault Owner",
          cardNumber: formData.cardNumber,
          last4Digits: last4,
          initialBalance: formData.initialBalance,
          balance: formData.initialBalance,
          expiryDate: exp,
          linkedAccountId: formData.linkedAccountId || "",
          purchaseMethod: formData.purchaseMethod || "Credit Card",
          remarks: formData.remarks || "",
        },
      });

      if (formData.initialBalance > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "DEPOSIT",
            amount: formData.initialBalance,
            category: "Gift Card",
            description: formData.remarks || `Initial balance for ${formData.brandName} Gift Card`,
            giftCardId: card.id,
            date: new Date(),
          },
        });
      }

      return card;
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating gift card:", error);
    return { success: false, error: error.message || "Failed to create gift card" };
  }
}

// =========================================================================
// 6. VAULT SUMMARY & ANALYTICS AGGREGATOR
// =========================================================================
export async function getVaultDataAction() {
  const userId = await getAuthenticatedUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      salutation: true,
      image: true,
      hideAmounts: true,
    },
  });

  const [bankAccounts, creditCards, physicalAssets, p2pContacts, giftCards, transactions] =
    await Promise.all([
      prisma.bankAccount.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditCard.findMany({
        where: { userId },
        include: { parentCard: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.physicalAsset.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.p2PContact.findMany({
        where: { userId },
        include: { p2pTransactions: { orderBy: { date: "desc" }, take: 5 } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.giftCard.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: {
          bankAccount: true,
          creditCard: true,
          physicalAsset: true,
          giftCard: true,
        },
        orderBy: { date: "desc" },
        take: 50,
      }),
    ]);

  // Calculations
  const bankTotal = bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0);
  const cashTotal = physicalAssets.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const giftTotal = giftCards.reduce((sum, g) => sum + (g.balance || 0), 0);

  // P2P: positive netBalance means they owe you (Receivable = Asset)
  // negative netBalance means you owe them (Payable = Liability)
  const p2pReceivables = p2pContacts
    .filter((p) => p.netBalance > 0)
    .reduce((sum, p) => sum + p.netBalance, 0);

  const p2pPayables = p2pContacts
    .filter((p) => p.netBalance < 0)
    .reduce((sum, p) => sum + Math.abs(p.netBalance), 0);

  const creditCardOutstandingTotal = creditCards.reduce(
    (sum, c) => sum + (c.totalOutstanding || 0),
    0
  );

  const grossAssets = bankTotal + cashTotal + giftTotal + p2pReceivables;
  const totalLiabilities = creditCardOutstandingTotal + p2pPayables;
  const netWorth = grossAssets - totalLiabilities;

  // Asset Breakdown Percentages for Recharts Donut
  const totalAssetSum = grossAssets > 0 ? grossAssets : 1;
  const assetBreakdown = [
    {
      name: "Bank",
      value: bankTotal,
      percentage: Math.round((bankTotal / totalAssetSum) * 100),
      color: "#3B82F6", // Blue
    },
    {
      name: "P2P (Receivables)",
      value: p2pReceivables,
      percentage: Math.round((p2pReceivables / totalAssetSum) * 100),
      color: "#10B981", // Emerald
    },
    {
      name: "Credit / Gift Cards",
      value: giftTotal,
      percentage: Math.round((giftTotal / totalAssetSum) * 100),
      color: "#F59E0B", // Amber
    },
    {
      name: "Physical Cash",
      value: cashTotal,
      percentage: Math.round((cashTotal / totalAssetSum) * 100),
      color: "#EC4899", // Pink/Rose
    },
  ];

  // Net Growth Trend Trajectory (Simulated realistic monthly / weekly checkpoints based on netWorth)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const growthData = months.map((m, idx) => {
    const factor = (idx + 1) / months.length;
    const value = Math.max(100000, Math.round(netWorth * (0.65 + 0.35 * factor)));
    return {
      period: m,
      netWorth: value,
      assets: Math.round(value * 1.3),
      liabilities: Math.round(value * 0.3),
    };
  });

  if (!user) {
    throw new Error("UNAUTHORIZED: Vault user account not found.");
  }

  return {
    user,
    summary: {
      netWorth,
      grossAssets,
      totalLiabilities,
      bankTotal,
      cashTotal,
      giftTotal,
      p2pReceivables,
      p2pPayables,
      creditCardOutstandingTotal,
    },
    bankAccounts,
    creditCards,
    physicalAssets,
    p2pContacts,
    giftCards,
    transactions,
    assetBreakdown,
    growthData,
  };
}
