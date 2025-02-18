"use server";

import { PUBLIC_ROOM_ID } from "@/constants";
import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(_, formData: any): Promise<any> {
  try {
    const newUser = await db.user.create({
      data: {
        username: formData.get("username"),
        email: "default@default.com",
        password: formData.get("password"),
        role: "USER",
      },
    });
    console.log("=========NEW USER======", newUser);
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        errors: {
          _form: error.message,
        },
      };
    }
    return {
      errors: {
        _form: "Something wrong!",
      },
    };
  }
  redirect("/chat");
}
