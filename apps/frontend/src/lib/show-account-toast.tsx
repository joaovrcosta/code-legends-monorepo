"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountToastTone = "success" | "error";

type AccountToastItem = {
  id: string;
  message: string;
  tone: AccountToastTone;
  duration: number;
};

interface AccountToastOptions {
  message: string;
  duration?: number;
}

const listeners = new Set<(toasts: AccountToastItem[]) => void>();
let toasts: AccountToastItem[] = [];

/** Rotas sem AppShell (header fixo) — alinhado a conditional-app-shell */
const ROUTES_WITHOUT_FIXED_HEADER = [
  "/login",
  "/signup",
  "/onboarding",
  "/classroom",
  "/cart",
  "/plans",
  "/certificates",
];

function hasFixedAppHeader(pathname: string | null) {
  if (!pathname) return true;
  return !ROUTES_WITHOUT_FIXED_HEADER.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function emit() {
  for (const listener of listeners) {
    listener(toasts);
  }
}

function createToastId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addToast(message: string, tone: AccountToastTone, duration: number) {
  const id = createToastId(tone);
  toasts = [{ id, message, tone, duration }, ...toasts].slice(0, 3);
  emit();
}

function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function showSuccessToast({
  message,
  duration = 4000,
}: AccountToastOptions) {
  addToast(message, "success", duration);
}

export function showErrorToast({
  message,
  duration = 5000,
}: AccountToastOptions) {
  addToast(message, "error", duration);
}

function AccountToastCard({
  toast,
  onDismiss,
}: {
  toast: AccountToastItem;
  onDismiss: (id: string) => void;
}) {
  const isSuccess = toast.tone === "success";
  const accentClass = isSuccess ? "bg-[#28a78d]" : "bg-red-400";
  const iconClass = isSuccess ? "text-[#28a78d]" : "text-red-400";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(toast.duration);
  const timerStartRef = useRef(Date.now());
  const timeoutRef = useRef<number | undefined>(undefined);

  const clearDismissTimer = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const scheduleDismiss = useCallback(() => {
    clearDismissTimer();
    if (remainingRef.current <= 0) {
      onDismiss(toast.id);
      return;
    }
    timerStartRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      onDismiss(toast.id);
    }, remainingRef.current);
  }, [clearDismissTimer, onDismiss, toast.id]);

  useEffect(() => {
    remainingRef.current = toast.duration;
    scheduleDismiss();
    return clearDismissTimer;
  }, [clearDismissTimer, scheduleDismiss, toast.duration]);

  const handleMouseEnter = () => {
    clearDismissTimer();
    const elapsed = Date.now() - timerStartRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    setPaused(true);
  };

  const handleMouseLeave = () => {
    if (remainingRef.current <= 0) {
      onDismiss(toast.id);
      return;
    }
    setPaused(false);
    scheduleDismiss();
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-md border border-[#25252A] bg-[#2d2d3a] px-5 py-4 text-white shadow-[0_14px_50px_rgba(0,0,0,0.55)]",
        "animate-in fade-in slide-in-from-top-2 duration-300",
      )}
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
        <div
          className={cn("h-full w-full origin-left", accentClass)}
          style={{
            animation: `account-toast-timer ${toast.duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        <Icon className={cn("h-5 w-5 shrink-0", iconClass)} strokeWidth={2} />

        <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-white">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#3a3a48] hover:text-white"
          aria-label="Fechar"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
}

export function AccountToastHost() {
  const pathname = usePathname();
  const [items, setItems] = useState<AccountToastItem[]>(toasts);
  const belowHeader = hasFixedAppHeader(pathname);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] flex w-[min(calc(100vw-2rem),380px)] flex-col gap-2",
        "right-4 lg:right-8",
        belowHeader
          ? [
              "top-[calc(var(--header-height-mobile)+var(--top-banner-height)+var(--header-top-offset)+1rem)]",
              "lg:top-[calc(var(--header-height-desktop)+var(--top-banner-height)+var(--header-top-offset)+1rem)]",
            ]
          : "top-4",
      )}
    >
      {items.map((item) => (
        <AccountToastCard
          key={item.id}
          toast={item}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}
