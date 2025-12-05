import { prisma } from "@/entities/db";
import { getLoginUser } from "@/entities/loginuser";
import { hashPassword } from "@/utils/hashPassword";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: process.env.LOGIN_SESSION_TIMEOUT
      ? parseInt(process.env.LOGIN_SESSION_TIMEOUT)
      : 300,
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        user: { label: "Username", type: "text", placeholder: "bibadmin" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        let retrievedUser;

        try {
          retrievedUser = await getLoginUser(prisma, req.body!.user);
        } catch (error) {
          console.error("Database connection error:", error);
          throw new Error("User Datenbank nicht verfügbar");
        }

        if (!retrievedUser) {
          return null;
        }

        const hashedPassword = hashPassword(req.body!.password);

        if (retrievedUser.password === hashedPassword) {
          const user = {
            id: "0",
            name: retrievedUser.username.toString(),
            email: retrievedUser.email.toString(),
            role: retrievedUser.role.toString(),
          };
          console.log("Passing user token back to middleware", retrievedUser);
          return user;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});
