"use server";

import { signIn } from "@/auth/authSetup";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validações
  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }

  try {
    // Usar NextAuth para fazer login sem redirect automático
    // O redirect será feito manualmente no cliente, e o middleware
    // vai interceptar e redirecionar para /onboarding se necessário
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    // Se for um erro de credenciais
    if ((error as { type?: string })?.type === "CredentialsSignin") {
      throw new Error("Email ou senha incorretos");
    }
    throw error;
  }
}
