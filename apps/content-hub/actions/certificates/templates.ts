"use server";

import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/actions/auth/get-auth-token";

export type CertificateTemplate = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export async function listCertificateTemplates(): Promise<{
  templates: CertificateTemplate[];
}> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Sessão não encontrada. Faça login no Content Hub.");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/certificate-templates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao listar modelos de certificado");
  }

  return response.json();
}

export async function createCertificateTemplate(data: {
  name: string;
  description: string;
}): Promise<{ template: CertificateTemplate }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Sessão não encontrada. Faça login no Content Hub.");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/certificate-templates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar modelo de certificado");
  }

  revalidatePath("/certificates");
  return response.json();
}

export async function updateCertificateTemplate(
  id: string,
  data: { name?: string; description?: string }
): Promise<{ template: CertificateTemplate }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Sessão não encontrada. Faça login no Content Hub.");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/certificate-templates/${id}`,
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
    throw new Error("Erro ao atualizar modelo de certificado");
  }

  revalidatePath("/certificates");
  return response.json();
}

export async function deleteCertificateTemplate(id: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Sessão não encontrada. Faça login no Content Hub.");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/certificate-templates/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao excluir modelo de certificado");
  }

  revalidatePath("/certificates");
}
