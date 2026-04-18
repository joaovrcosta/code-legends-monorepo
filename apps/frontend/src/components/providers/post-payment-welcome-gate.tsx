"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWelcomePaidStore } from "@/stores/welcome-paid-store";
import { getPostPurchaseWelcome } from "@/actions/account/post-purchase-welcome";
import type { PostPurchaseWelcomeResponse } from "@/actions/account/post-purchase-welcome";

const PENDING_KEY = "cl_pending_welcome";
const BACKOFF_MS = [0, 5_000, 15_000, 30_000] as const;

function shouldShowModal(data: PostPurchaseWelcomeResponse): boolean {
  const show =
    data.showPostPurchaseWelcome || data.showModal === true;
  return Boolean(show && data.paymentId);
}

export function PostPaymentWelcomeGate() {
  const { status } = useSession();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      hasRunRef.current = false;
      return;
    }

    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    let cancelled = false;

    const openFromResponse = (data: PostPurchaseWelcomeResponse) => {
      if (!data.paymentId || cancelled) return;
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
    };

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    const run = async () => {
      const pending =
        typeof window !== "undefined" &&
        sessionStorage.getItem(PENDING_KEY) === "1";

      if (pending) {
        sessionStorage.removeItem(PENDING_KEY);
      }

      if (!pending) {
        const data = await getPostPurchaseWelcome().catch(() => null);
        if (cancelled || !data) return;
        if (shouldShowModal(data)) {
          openFromResponse(data);
        }
        return;
      }

      for (let i = 0; i < BACKOFF_MS.length && !cancelled; i++) {
        if (i > 0) {
          const wait = BACKOFF_MS[i] - BACKOFF_MS[i - 1];
          await sleep(wait);
          if (cancelled) return;
        }

        const data = await getPostPurchaseWelcome().catch(() => null);
        if (cancelled) return;

        if (!data) {
          continue;
        }

        if (shouldShowModal(data)) {
          openFromResponse(data);
          return;
        }

        if (data.reason === "already_acked") {
          return;
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [status]);

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
      window.removeEventListener(
        "cl-open-welcome-paid",
        handler as EventListener
      );
  }, []);

  return null;
}
