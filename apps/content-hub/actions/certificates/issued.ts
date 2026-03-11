"use server";

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
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<{ certificates: IssuedCertificate[]; total: number; totalPages: number }> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/certificates/all`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ["certificates-all"] },
  });

  if (!response.ok) {
    throw new Error("Erro ao listar certificados emitidos");
  }

  return response.json();
}
