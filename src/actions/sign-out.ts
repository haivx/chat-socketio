"use server";

import { COOKIE_NAME } from "@/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get the cookies instance
    const cookieStore = cookies();

    // Delete the cookie by setting maxAge to 0 and expires to a past date
    await cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error("Error deleting cookie:", error);
    return { success: false, message: "Failed to logout" };
  }
  redirect("/");
}
