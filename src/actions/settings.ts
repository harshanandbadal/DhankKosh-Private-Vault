"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "./vault";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const ProfileSchema = z.object({
  salutation: z.enum(["Mr.", "Mrs.", "Ms.", "Dr."]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().optional(),
});

export async function updateProfileAction(formData: {
  salutation: "Mr." | "Mrs." | "Ms." | "Dr.";
  name: string;
  password?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const validated = ProfileSchema.parse(formData);

    const updateData: any = {
      salutation: validated.salutation,
      name: validated.name,
    };

    if (validated.password && validated.password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(validated.password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

// Reset Vault Data (Keep User Account Intact)
export async function resetVaultDataAction() {
  try {
    const userId = await getAuthenticatedUserId();

    await prisma.$transaction(async (tx) => {
      // 1. Delete all transactions
      await tx.transaction.deleteMany({ where: { userId } });

      // 2. Delete all P2P sub-transactions & contacts
      const userContacts = await tx.p2PContact.findMany({ where: { userId }, select: { id: true } });
      const contactIds = userContacts.map((c) => c.id);
      if (contactIds.length > 0) {
        await tx.p2PTransaction.deleteMany({ where: { p2pAccountId: { in: contactIds } } });
      }
      await tx.p2PContact.deleteMany({ where: { userId } });

      // 3. Delete gift cards
      await tx.giftCard.deleteMany({ where: { userId } });

      // 4. Delete credit cards (break self relations first)
      await tx.creditCard.updateMany({
        where: { userId },
        data: { parentCardId: null },
      });
      await tx.creditCard.deleteMany({ where: { userId } });

      // 5. Delete bank accounts
      await tx.bankAccount.deleteMany({ where: { userId } });

      // 6. Delete physical assets
      await tx.physicalAsset.deleteMany({ where: { userId } });

      // 7. Delete net worth snapshots
      await tx.netWorthSnapshot.deleteMany({ where: { userId } });
    });

    revalidatePath("/");
    revalidatePath("/reports");
    revalidatePath("/p2p");
    revalidatePath("/settings");
    return { success: true, message: "Vault data reset successfully" };
  } catch (error: any) {
    console.error("Error resetting vault data:", error);
    return { success: false, error: error.message || "Failed to reset vault data" };
  }
}

// Delete Account Permanently (Cascades Neon DB)
export async function deleteAccountAction() {
  try {
    const userId = await getAuthenticatedUserId();

    await prisma.$transaction(async (tx) => {
      // Unlink parent credit cards to avoid foreign key cycle constraints
      await tx.creditCard.updateMany({
        where: { userId },
        data: { parentCardId: null },
      });
      // Delete user (cascade deletes all related tables)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    revalidatePath("/");
    return { success: true, message: "Account deleted permanently" };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { success: false, error: error.message || "Failed to delete account" };
  }
}

// Seed / Demo Data Option ("Mr. Sharma" sample vault from design screenshots)
export async function seedSampleVaultAction() {
  try {
    const userId = await getAuthenticatedUserId();

    await prisma.$transaction(async (tx) => {
      // 1. Update user title and name
      await tx.user.update({
        where: { id: userId },
        data: {
          name: "Mr. Sharma",
          salutation: "Mr.",
        },
      });

      // Clear existing records to cleanly load sample state
      await tx.transaction.deleteMany({ where: { userId } });
      const existingContacts = await tx.p2PContact.findMany({ where: { userId }, select: { id: true } });
      if (existingContacts.length > 0) {
        await tx.p2PTransaction.deleteMany({ where: { p2pAccountId: { in: existingContacts.map((c) => c.id) } } });
      }
      await tx.p2PContact.deleteMany({ where: { userId } });
      await tx.giftCard.deleteMany({ where: { userId } });
      await tx.creditCard.updateMany({ where: { userId }, data: { parentCardId: null } });
      await tx.creditCard.deleteMany({ where: { userId } });
      await tx.bankAccount.deleteMany({ where: { userId } });
      await tx.physicalAsset.deleteMany({ where: { userId } });

      // 2. Create Bank Accounts
      const hdfc = await tx.bankAccount.create({
        data: {
          userId,
          bankName: "HDFC Bank",
          holderName: "Mr. Sharma",
          accountType: "Savings",
          accountNumber: "0219023223",
          last4Digits: "3223",
          balance: 1450000,
          ifscCode: "HDFC0000123",
          branch: "Connaught Place, New Delhi",
        },
      });

      const sbi = await tx.bankAccount.create({
        data: {
          userId,
          bankName: "SBI Bank",
          holderName: "Mr. Sharma",
          accountType: "Salary",
          accountNumber: "0210613620",
          last4Digits: "3620",
          balance: 850000,
          ifscCode: "SBIN0001824",
          branch: "Cyber City, Gurugram",
        },
      });

      const icici = await tx.bankAccount.create({
        data: {
          userId,
          bankName: "ICICI Bank",
          holderName: "Mr. Sharma",
          accountType: "Current",
          accountNumber: "0210612620",
          last4Digits: "2620",
          balance: 620000,
          ifscCode: "ICIC0000011",
          branch: "Bandra Kurla Complex, Mumbai",
        },
      });

      // 3. Create Credit Cards
      const regalia = await tx.creditCard.create({
        data: {
          userId,
          cardName: "HDFC Regalia Gold",
          holderName: "Mr. Sharma",
          last4Digits: "8901",
          creditLimit: 1250000,
          availableBalance: 1090000,
          totalOutstanding: 160000,
          dueDateDay: 15,
          theme: "blue",
          isSharedLimit: false,
        },
      });

      const axis = await tx.creditCard.create({
        data: {
          userId,
          cardName: "Axis Magnus",
          holderName: "Mr. Sharma",
          last4Digits: "4321",
          creditLimit: 1250000,
          availableBalance: 965000,
          totalOutstanding: 285000,
          dueDateDay: 20,
          theme: "red",
          isSharedLimit: false,
        },
      });

      const supplementaryCard = await tx.creditCard.create({
        data: {
          userId,
          cardName: "HDFC Regalia Add-on",
          holderName: "Mrs. Sharma",
          last4Digits: "7865",
          creditLimit: 250000,
          availableBalance: 200000,
          totalOutstanding: 50000,
          dueDateDay: 15,
          theme: "gold",
          isSharedLimit: true,
          parentCardId: regalia.id,
        },
      });

      // 4. Create Physical Cash / Asset
      const homeSafe = await tx.physicalAsset.create({
        data: {
          userId,
          storageName: "Home Safe Locker",
          holderName: "Mr. Sharma",
          currentBalance: 450000,
          denominations: JSON.stringify({ "500": 800, "200": 200, "100": 100 }),
          locationDetails: "Master Bedroom Vault",
          remarks: "Emergency liquid reserve",
          assetType: "CASH",
        },
      });

      // 5. Create P2P Contacts
      const contactRahul = await tx.p2PContact.create({
        data: {
          userId,
          name: "Rahul Verma",
          phone: "+91 98765 43210",
          email: "rahul.verma@example.com",
          initialStatus: "They Owe Me (To Receive)",
          openingBalance: 150000,
          netBalance: 150000,
          group: "Friends",
          relationshipRemarks: "Seed investment loan for tech studio",
        },
      });

      const contactVikram = await tx.p2PContact.create({
        data: {
          userId,
          name: "Vikram Malhotra",
          phone: "+91 98111 22334",
          email: "vikram@malhotragroup.in",
          initialStatus: "They Owe Me (To Receive)",
          openingBalance: 85000,
          netBalance: 85000,
          group: "Business",
          relationshipRemarks: "Advance for equipment procurement",
        },
      });

      const contactAnanya = await tx.p2PContact.create({
        data: {
          userId,
          name: "Ananya Sen",
          phone: "+91 97654 32190",
          email: "ananya.sen@example.com",
          initialStatus: "I Owe Them (To Pay)",
          openingBalance: 30000,
          netBalance: -30000,
          group: "Colleagues",
          relationshipRemarks: "Pending shared conference reimbursement",
        },
      });

      // 6. Create Gift Card
      const giftCard = await tx.giftCard.create({
        data: {
          userId,
          brandName: "Amazon Pay Voucher",
          ownerName: "Mr. Sharma",
          cardNumber: "9876-5432-1098-7654",
          last4Digits: "7654",
          initialBalance: 25000,
          balance: 24000,
          expiryDate: new Date("2027-12-31"),
          linkedAccountId: hdfc.id,
          purchaseMethod: "Credit Card",
          remarks: "Annual corporate Diwali rewards voucher",
        },
      });

      // 7. Create Historical Unified Ledger Transactions
      const sampleTxs = [
        {
          userId,
          type: "DEPOSIT",
          amount: 250000,
          category: "Salary",
          description: "Monthly Executive Compensation - TechCorp",
          bankAccountId: sbi.id,
          date: new Date(Date.now() - 3 * 86400000),
        },
        {
          userId,
          type: "CARD_SPEND",
          amount: 18500,
          category: "Fuel & Travel",
          description: "Flight Tickets to Bengaluru - IndiGo",
          creditCardId: regalia.id,
          date: new Date(Date.now() - 2 * 86400000),
        },
        {
          userId,
          type: "P2P_RECEIVE",
          amount: 25000,
          category: "P2P Settlement",
          description: "Partial payback received from Rahul Verma",
          bankAccountId: hdfc.id,
          date: new Date(Date.now() - 1 * 86400000),
        },
        {
          userId,
          type: "WITHDRAW",
          amount: 40000,
          category: "Groceries & Home",
          description: "Monthly Home Safe Cash replenishment",
          bankAccountId: hdfc.id,
          physicalAssetId: homeSafe.id,
          date: new Date(),
        },
      ];

      for (const t of sampleTxs) {
        await tx.transaction.create({ data: t });
      }
    });

    revalidatePath("/");
    revalidatePath("/reports");
    revalidatePath("/p2p");
    revalidatePath("/settings");
    return { success: true, message: "Sample vault initialized for Mr. Sharma" };
  } catch (error: any) {
    console.error("Error seeding sample vault:", error);
    return { success: false, error: error.message || "Failed to seed sample vault" };
  }
}
