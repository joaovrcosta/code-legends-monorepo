"use server";

import { clearSession } from "./get-auth-token";

export async function logoutUser() {
  await clearSession();
}
