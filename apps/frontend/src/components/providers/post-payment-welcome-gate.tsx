"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWelcomePaidStore } from "@/stores/welcome-paid-store";

type SubscriptionOverview = {
  plan: { slug: string; name: string; imageUrl?: string | null } | null;
  subscription:
  | { id: string; plan: string; status: string; startsAt: string; endsAt: string }
  | null;
  hasPaidPlan: boolean;
};

const LS_HAS_PAID_LAST = "cl_has_paid_plan:last";
const LS_SHOWN_PREFIX = "cl_welcome_shown_for_plan:";

function safeGetBool(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function safeSetBool(key: string, v: boolean) {
  try {
    localStorage.setItem(key, v ? "1" : "0");
  } catch {
  }
}

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
}

async function fetchSubscriptionOverview(token: string): Promise<SubscriptionOverview | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  const res = await fetch(`${baseUrl}/me/subscription-overview`, {
    method: "GET",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as SubscriptionOverview;
}

export function PostPaymentWelcomeGate() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    const token = (session as unknown as { accessToken?: string } | null)?.accessToken;
    if (!token) return;

    let cancelled = false;
    const startedAt = Date.now();
    const maxMs = 30_000;
    const intervalMs = 3_000;

    const run = async () => {
      const prevHasPaid = safeGetBool(LS_HAS_PAID_LAST);
      const hasPrev = (() => {
        try {
          return localStorage.getItem(LS_HAS_PAID_LAST) != null;
        } catch {
          return false;
        }
      })();

      while (!cancelled && Date.now() - startedAt <= maxMs) {
        const data = await fetchSubscriptionOverview(token).catch(() => null);
        if (!data) {
          await new Promise((r) => setTimeout(r, intervalMs));
          continue;
        }

        const nowHasPaid = !!data.hasPaidPlan;
        safeSetBool(LS_HAS_PAID_LAST, nowHasPaid);

        const planSlug = data.plan?.slug ?? (nowHasPaid ? "PAID" : "FREE");
        const shownKey = `${LS_SHOWN_PREFIX}${planSlug}`;
        const alreadyShown = safeGet(shownKey) === "1";

        const shouldShow =
          nowHasPaid && (!hasPrev || prevHasPaid === false) && !alreadyShown;

        if (shouldShow) {
          safeSet(shownKey, "1");
          useWelcomePaidStore.getState().open({
            planSlug: data.plan?.slug ?? null,
            planName: data.plan?.name ?? null,
            planImageUrl: data.plan?.imageUrl ?? null,
            subscriptionId: data.subscription?.id ?? null,
            endsAt: data.subscription?.endsAt ?? null,
          });
          return;
        }

        await new Promise((r) => setTimeout(r, intervalMs));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  useEffect(() => {
    const enabled = process.env.NEXT_PUBLIC_DEBUG_WELCOME_MODAL === "1";
    if (!enabled) return;

    const handler = () => {
      useWelcomePaidStore.getState().open({
        planSlug: "PREMIUM",
        planName: "Premium",
        planImageUrl: null,
        subscriptionId: null,
        endsAt: null,
      });
    };
    window.addEventListener("cl-open-welcome-paid", handler as EventListener);
    return () =>
      window.removeEventListener("cl-open-welcome-paid", handler as EventListener);
  }, []);

  return null;
}

