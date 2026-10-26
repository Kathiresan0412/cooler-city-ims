import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
