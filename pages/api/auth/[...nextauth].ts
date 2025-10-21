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
        // Add logic here to look up the user from the credentials supplied

        /*console.log(
          "Next-Auth - Request for login",
          req.body!.user,
          req.body!.password
        );*/

        const retrievedUser = await getLoginUser(prisma, req.body!.user);
        const hashedPassword = hashPassword(req.body!.password);
        const user = {
          id: "0",
          name: retrievedUser!.username.toString(),
          email: retrievedUser!.email.toString(),
          role: retrievedUser!.role.toString(),
        };

        if (retrievedUser && retrievedUser!.password === hashedPassword) {
          console.log("Passing user token back to middleware", retrievedUser);
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});
