"use server";

import { revalidatePath } from "next/cache";

export type CertificateTemplate = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export async function listCertificateTemplates(token: string): Promise<{ templates: CertificateTemplate[] }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificate-templates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ["certificate-templates"] },
  });

  if (!response.ok) {
    throw new Error("Erro ao listar modelos de certificado");
  }

  return response.json();
}

export async function createCertificateTemplate(
  token: string,
  data: { name: string; description: string }
): Promise<{ template: CertificateTemplate }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificate-templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar modelo de certificado");
  }

  revalidatePath("/certificates");
  return response.json();
}

export async function updateCertificateTemplate(
  token: string,
  id: string,
  data: { name?: string; description?: string }
): Promise<{ template: CertificateTemplate }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificate-templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar modelo de certificado");
  }

  revalidatePath("/certificates");
  return response.json();
}

export async function deleteCertificateTemplate(token: string, id: string): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificate-templates/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir modelo de certificado");
  }

  revalidatePath("/certificates");
}
