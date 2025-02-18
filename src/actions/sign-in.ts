"use server";

import { PUBLIC_ROOM_ID } from "@/constants";
import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(_, formData: any): Promise<any> {
  const { username, password } = formData;
  const newUser = await db.user.create({
    data: {
      username: username,
      email: "default@default.com",
      password: password,
      role: "USER",
    },
  });
  const cookieStore = await cookies();

  cookieStore.set({
    name: "userinformation",
    value: JSON.stringify({
      username: newUser.username,
      email: newUser.email,
      id: newUser.id,
    }),
    httpOnly: true,
    path: "/",
  });

  // Khởi tạo room
  const existingRoom = await db.conversation.findUnique({
    where: { id: PUBLIC_ROOM_ID },
  });

  if (!existingRoom) {
    await db.conversation.create({
      data: {
        id: PUBLIC_ROOM_ID,
      },
    });
  }
  redirect("/chat");
}
