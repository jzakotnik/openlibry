import { addUser } from "@/entities/user";
import { UserType } from "@/entities/UserType";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";

type Data = {
  data: string;
};

type User = {
  user: UserType;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | User>
) {
  if (req.method === "POST") {
    try {
      const userslist = req.body as any;
      const users = userslist[2].data;
      const migratedUsers = users?.map((u: any) => {
        const user = {
          id: parseInt(u.mbrid),
          lastName: u.last_name,
          firstName: u.first_name,
          schoolTeacherName: u.school_teacher,
          schoolGrade: u.school_grade,
        } as UserType;
        addUser(prisma, user);
        return user;
      });
      console.log(migratedUsers);
      res
        .status(200)
        .json({ data: "User " + JSON.stringify(migratedUsers) + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
