"use server";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const avatar = formData.get("avatar") as string;

  // Validações
  if (!name || !email || !password || !confirmPassword) {
    throw new Error("Todos os campos são obrigatórios");
  }

  if (password !== confirmPassword) {
    throw new Error("As senhas não coincidem");
  }

  if (password.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres");
  }

  try {
    // Criar novo usuário na API externa
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        avatar:
          avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=random`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar usuário");
    }

    const data = await response.json();

    return {
      success: true,
      message: "Usuário criado com sucesso",
      userId: data.id,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao criar usuário");
  }
}
