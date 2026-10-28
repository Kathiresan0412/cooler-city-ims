import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        const isValid = Boolean(user?.passwordHash && await compare(password, user.passwordHash));
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ipAddress = forwardedFor?.split(",")[0]?.trim()
          || request.headers.get("x-real-ip");

        await prisma.loginHistory.create({
          data: {
            userId: user?.id,
            email: normalizedEmail,
            successful: isValid,
            ipAddress: ipAddress?.slice(0, 100),
            userAgent: request.headers.get("user-agent")?.slice(0, 1000),
          },
        });

        if (!isValid || !user) return null;

        await prisma.auditLog.create({
          data: { userId: user.id, action: "LOGIN", resource: "Auth" },
        });

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
