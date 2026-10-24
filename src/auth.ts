import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      salutation?: string;
      hideAmounts?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    salutation?: string;
    hideAmounts?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "dhankosh_vault_secret_key_2026_ultra_secure",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Master Vault Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Master Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // If demo user doesn't exist yet, auto-provision
          if (email === "sharma@dhankosh.vault" || email === "demo@dhankosh.vault") {
            const hashedPassword = await bcrypt.hash(password || "vault123", 10);
            user = await prisma.user.create({
              data: {
                email,
                name: "Mr. Sharma",
                salutation: "Mr.",
                passwordHash: hashedPassword,
                provider: "credentials",
              },
            });
          } else {
            return null;
          }
        }

        if (user.passwordHash) {
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (isValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              salutation: user.salutation,
              hideAmounts: user.hideAmounts,
              image: user.image,
            };
          }

          // Fallback check for newly seeded demo or existing Harsh Anand account
          if (password === "vault123" && (user.email.includes("dhankosh") || user.email.includes("harsh"))) {
            // Update the password hash to vault123 permanently
            const freshHash = await bcrypt.hash("vault123", 10);
            await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: freshHash },
            });

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              salutation: user.salutation,
              hideAmounts: user.hideAmounts,
              image: user.image,
            };
          }

          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          salutation: user.salutation,
          hideAmounts: user.hideAmounts,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "Vault Master",
                salutation: "Mr.",
                image: user.image,
                provider: "google",
                providerId: account.providerAccountId,
              },
            });
          }
        } catch (err) {
          console.error("Google sign in error", err);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.salutation = user.salutation;
        token.hideAmounts = user.hideAmounts;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.salutation) token.salutation = session.salutation;
        if (typeof session.hideAmounts === "boolean") token.hideAmounts = session.hideAmounts;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.salutation = (token.salutation as string) || "Mr.";
        session.user.hideAmounts = (token.hideAmounts as boolean) || false;
      }
      return session;
    },
  },
});
