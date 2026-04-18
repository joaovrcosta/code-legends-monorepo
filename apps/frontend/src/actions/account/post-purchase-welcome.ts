"use server";

import { getAuthToken } from "@/actions/auth/session";

export type PostPurchaseWelcomeReason = "no_payment" | "already_acked";

export type PostPurchaseWelcomeResponse = {
  showModal?: boolean;
  showPostPurchaseWelcome: boolean;
  reason: PostPurchaseWelcomeReason | null;
  paymentId: string | null;
  kind: "subscription" | "course" | "generic" | null;
  planSlug: string | null;
  planName: string | null;
  planImageUrl: string | null;
  planColorHex: string | null;
  subscriptionId: string | null;
  endsAt: string | null;
  title: string | null;
  subtitle: string | null;
};

export async function getPostPurchaseWelcome(): Promise<PostPurchaseWelcomeResponse | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/post-purchase-welcome`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  return (await res.json()) as PostPurchaseWelcomeResponse;
}

export async function ackPostPurchaseWelcome(paymentId: string): Promise<boolean> {
  const token = await getAuthToken();
  if (!token) return false;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/post-purchase-welcome-ack`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentId }),
      cache: "no-store",
    }
  );

  return res.status === 204;
}
