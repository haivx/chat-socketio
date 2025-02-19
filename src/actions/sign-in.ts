"use server";

import { COOKIE_NAME, PUBLIC_ROOM_ID } from "@/constants";
import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(_, formData: any): Promise<any> {
  try {
    const newUser = await db.user.create({
      data: {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: "USER",
      },
    });
    const cookieStore = await cookies();

    cookieStore.set({
      name: COOKIE_NAME,
      value: JSON.stringify({
        username: newUser.username,
        email: newUser.email,
        id: newUser.id,
      }),
      // httpOnly: true,
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
