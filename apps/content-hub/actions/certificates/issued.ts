"use server";

import { getAuthToken } from "@/actions/auth/get-auth-token";
import { CertificateTemplate } from "./templates";

export type IssuedCertificate = {
  id: string;
  userId: string;
  courseId: string;
  templateId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  template: CertificateTemplate | null;
};

export async function listAllCertificates(
  page: number = 1,
  limit: number = 20
): Promise<{
  certificates: IssuedCertificate[];
  total: number;
  totalPages: number;
}> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Sessão não encontrada. Faça login no Content Hub.");
  }

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/certificates/all`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erro ao listar certificados emitidos");
  }

  return response.json();
}
