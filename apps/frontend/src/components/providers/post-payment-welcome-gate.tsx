"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWelcomePaidStore } from "@/stores/welcome-paid-store";
import { getPostPurchaseWelcome } from "@/actions/account/post-purchase-welcome";

export function PostPaymentWelcomeGate() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    const startedAt = Date.now();
    const maxMs = 60_000;
    const intervalMs = 3_000;

    const run = async () => {
      while (!cancelled && Date.now() - startedAt <= maxMs) {
        const data = await getPostPurchaseWelcome().catch(() => null);
        if (!data) {
          await new Promise((r) => setTimeout(r, intervalMs));
          continue;
        }

        if (
          data.showPostPurchaseWelcome &&
          data.paymentId &&
          !cancelled
        ) {
          useWelcomePaidStore.getState().open({
            paymentId: data.paymentId,
            planSlug: data.planSlug,
            planName: data.planName,
            planImageUrl: data.planImageUrl,
            planColorHex: data.planColorHex,
            subscriptionId: data.subscriptionId,
            endsAt: data.endsAt,
            welcomeSubtitle: data.subtitle,
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
