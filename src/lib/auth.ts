import { NextAuthOptions, DefaultSession, User } from "next-auth";

interface AuthUser extends User {
  id: string;
  nik: string;
  role: string;
}
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { credentials as credentialsTable, users as usersTable } from "../db/schema";
import bcrypt from "bcrypt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      nik: string;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    nik: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        nik: { label: "NIK", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nik || !credentials?.password) {
          return null;
        }

        try {
          const userCred = await db
            .select({
              id: usersTable.id,
              name: usersTable.name,
              role: usersTable.role,
              nik: usersTable.nik,
              password: credentialsTable.password,
            })
            .from(credentialsTable)
            .innerJoin(
              usersTable,
              eq(credentialsTable.userId, usersTable.id)
            )
            .where(eq(usersTable.nik, credentials.nik))
            .limit(1);

          if (!userCred || userCred.length === 0 || userCred[0].role === "user") {
            return null;
          }

          const user = userCred[0] as {
            id: number;
            name: string;
            role: string;
            password: string;
          };
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id.toString(),
            nik: credentials.nik,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If trying to access root path after login, redirect based on role
      if (url === baseUrl || url === `${baseUrl}/`) {
        const session = await fetch(`${baseUrl}/api/auth/session`).then(res => res.json());
        if (session?.user?.role === "admin") {
          return `${baseUrl}/admin`;
        } else if (session?.user?.role === "officer") {
          return `${baseUrl}/officer`;
        }
        return `${baseUrl}/dashboard`;
      }
      // Allow all other urls
      return url;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nik = token.nik;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as AuthUser).role;
        token.nik = (user as AuthUser).nik;
      }
      return token;
    },
  },
};
