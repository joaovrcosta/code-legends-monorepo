import NextAuth from "next-auth";
import { credentialsProvider } from "./providers/credentials";
import { googleProvider } from "./providers/google";
import { jwtCallback } from "./callbacks/jwt";
import { sessionCallback } from "./callbacks/session";

export const { handlers, signIn, signOut, auth } = (NextAuth as any)({
  providers: [
    credentialsProvider,
    googleProvider,
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});