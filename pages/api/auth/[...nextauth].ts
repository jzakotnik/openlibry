import { getLoginUser } from "@/entities/loginuser";
import { hashPassword } from "@/utils/hashPassword";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const prisma = new PrismaClient();
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Username",

      credentials: {
        user: { label: "Username", type: "text", placeholder: "bibadmin" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        console.log(
          "Next-Auth - Request for login",
          req.body!.user,
          req.body!.password
        );

        const retrievedUser = await getLoginUser(prisma, req.body!.user);
        const hashedPassword = hashPassword(req.body!.password);
        //const user = { id: "1", name: "J Smith", email: "jsmith@example.com" };
        if (retrievedUser && retrievedUser!.password === hashedPassword) {
          console.log("Passing user token back to middleware", retrievedUser);
          const user = {
            user: retrievedUser.username,
            email: retrievedUser.email,
            role: retrievedUser.role,
          };
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
});
