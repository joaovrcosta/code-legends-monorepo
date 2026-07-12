"use server";

import { getAuthToken } from "@/actions/auth/get-auth-token";
import { revalidatePath } from "next/cache";

export type PaymentSettings = {
  handlerKey: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "DEPRECATED" | "DISABLED" | null;
  supportedMethods: string[];
  providerRegistered: boolean;
  credentials: {
    apiKeyConfigured: boolean;
    webhookSecretConfigured: boolean;
  };
  checkoutReady: boolean;
};

async function paymentSettingsFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Não autenticado");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    },
  );

  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      body.message ?? `Erro na API (${response.status})`,
    );
  }

  return body as T;
}

export async function getPaymentSettings(): Promise<{
  settings: PaymentSettings;
}> {
  return paymentSettingsFetch<{ settings: PaymentSettings }>(
    "/system-settings/payments",
  );
}

export async function bootstrapPaymentSettings(): Promise<{
  settings: PaymentSettings;
}> {
  const result = await paymentSettingsFetch<{ settings: PaymentSettings }>(
    "/system-settings/payments/bootstrap",
    { method: "POST" },
  );
  revalidatePath("/settings/payments");
  return result;
}
