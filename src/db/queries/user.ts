import type { User } from "@prisma/client";
import { db } from "@/db";

export const createUser = (data: User): Promise<any> => {
  console.log("QUERY", data);
  return db.user.create({
    data: {
      username: data.username,
      email: "default@default.com",
      password: data.password,
      role: data.role,
    },
  });
};
