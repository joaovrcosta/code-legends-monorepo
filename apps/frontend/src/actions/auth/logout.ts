"use server";

import { signOut } from "@/auth/authSetup";

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
