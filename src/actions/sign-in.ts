"use server";

import { COOKIE_NAME, PUBLIC_ROOM_ID } from "@/constants";
import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(_, formData: any): Promise<any> {
  const username = formData.get("username");
  const email = formData.get("email");
  if (!username || !email) {
    return {
      errors: {
        _form: "Please fill in the form",
      },
    };
  }
  try {
    let currentUser = null;
    currentUser = await db.user.findFirst({
      where: {
        OR: [
          { username: formData.get("username") },
          { email: formData.get("email") },
        ],
      },
    });

    if (!currentUser) {
      currentUser = await db.user.create({
        data: {
          username: formData.get("username"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: "USER",
        },
      });
    }

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

    const cookieStore = await cookies();

    cookieStore.set({
      name: COOKIE_NAME,
      value: JSON.stringify({
        username: currentUser.username,
        email: currentUser.email,
        id: currentUser.id,
        roomChat: PUBLIC_ROOM_ID,
      }),
      // httpOnly: true,
      path: "/",
    });
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
