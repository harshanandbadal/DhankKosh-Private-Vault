"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  salutation: z.enum(["Mr.", "Mrs.", "Ms.", "Dr."]).default("Mr."),
  name: z.string().trim().min(2, "Full Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Master Password must be at least 6 characters"),
});

const ResetPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  newPassword: z.string().min(6, "New Master Password must be at least 6 characters"),
});

export async function registerUserAction(formData: {
  salutation: string;
  name: string;
  email: string;
  password: string;
}) {
  try {
    const validated = RegisterSchema.parse(formData);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return {
        success: false,
        error: "A vault account with this email already exists. Please unlock with your master password.",
      };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        salutation: validated.salutation,
        passwordHash: hashedPassword,
        provider: "credentials",
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      message: "Vault master account created successfully! You can now unlock your vault.",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    console.error("Register user error:", error);
    return { success: false, error: error.message || "Failed to create vault account" };
  }
}

export async function resetMasterPasswordAction(formData: {
  email: string;
  newPassword: string;
}) {
  try {
    const validated = ResetPasswordSchema.parse(formData);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return {
        success: false,
        error: "No vault account found matching this email address.",
      };
    }

    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Master vault password reset successfully! You can now unlock your vault.",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    console.error("Reset password error:", error);
    return { success: false, error: error.message || "Failed to reset master password" };
  }
}
