"use server";

export interface Request {
  id: string;
  userId: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS";
  title: string | null;
  description: string | null;
  data: string | null;
  response: string | null;
  respondedBy: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ListRequestsResponse {
  requests: Request[];
}

export async function listRequests(token: string): Promise<ListRequestsResponse> {
  if (!token) {
    return { requests: [] };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Erro ao buscar solicitações:", response.statusText);
      return { requests: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return { requests: [] };
  }
}
