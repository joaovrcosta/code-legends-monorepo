"use server";

export interface UpdateRequestData {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS";
  response?: string;
}

export interface UpdateRequestResponse {
  success: boolean;
  message: string;
  request?: any;
}

export async function updateRequest(
  id: string,
  data: UpdateRequestData,
  token: string
): Promise<UpdateRequestResponse> {
  if (!token) {
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Erro ao atualizar solicitação",
      };
    }

    const result = await response.json();

    return {
      success: true,
      message: "Solicitação atualizada com sucesso",
      request: result.request,
    };
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error);
    return {
      success: false,
      message: "Erro ao atualizar solicitação. Tente novamente.",
    };
  }
}
