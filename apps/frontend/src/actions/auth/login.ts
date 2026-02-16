"use server";

import { signIn } from "@/auth/authSetup";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if ((error as { type?: string })?.type === "CredentialsSignin") {
      throw new Error("Email ou senha incorretos");
    }
    throw error;
  }
}
