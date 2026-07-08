import type { PlanInfo } from "@/components/cart/constants";
import type { PlanFromAPI } from "@/actions/plan/list-plans";

export interface PlanFromAPIInput {
  slug: string;
  name: string;
  description: string | null;
  colorHex?: string | null;
  amountCents: number;
  /** Data de expiração (Date, ISO string ou null) - opcional */
  expirationDate?: Date | string | null;
}

const PLAN_ICON_BY_SLUG: Record<string, string> = {
  pro: "/pro-plan-icon.svg",
  premium: "/premium-plan-icon.svg",
  free: "/free-plan-icon.svg",
};

const PLAN_COLOR_BY_SLUG: Record<string, string> = {
  pro: "#8234E9",
  premium: "#FF6200",
  free: "#B8E62E",
};

function formatBRL(cents: number): string {
  const value = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Converte plano da API para o formato usado no carrinho (PlanInfo). */
export function planFromApiToPlanInfo(p: PlanFromAPIInput): PlanInfo {
  const priceStr = formatBRL(p.amountCents);
  const installmentValue = Math.round(p.amountCents / 12);
  const installmentsStr = `12x de ${formatBRL(installmentValue)}`;
  const features = p.description
    ? p.description.split(/[.;]\s*/).filter(Boolean).map((s) => s.trim())
    : [];
  const slug = p.slug.toLowerCase();
  const icon = PLAN_ICON_BY_SLUG[slug] ?? "/pro-plan-icon.svg";
  const colorHex = p.colorHex ?? PLAN_COLOR_BY_SLUG[slug] ?? null;
  let expirationDate: string | null = null;
  if (p.expirationDate != null) {
    const d =
      typeof p.expirationDate === "string"
        ? new Date(p.expirationDate)
        : p.expirationDate;
    if (!Number.isNaN(d.getTime())) {
      expirationDate = d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }
  return {
    icon,
    title: p.name,
    description: p.description ?? "",
    colorHex,
    price: priceStr,
    installments: installmentsStr,
    features:
      features.length > 0 ? features : [p.description ?? "Acesso completo ao plano."],
    expirationDate: expirationDate ?? undefined,
  };
}

/** Plano pago ativo com maior `order` (empate: maior `amountCents`). */
export function findHighestPaidPlan(
  plans: PlanFromAPI[],
): PlanFromAPI | null {
  const paid = plans.filter((p) => p.active && p.amountCents > 0);
  if (paid.length === 0) return null;

  return paid.reduce((best, plan) => {
    if (plan.order !== best.order) {
      return plan.order > best.order ? plan : best;
    }
    return plan.amountCents > best.amountCents ? plan : best;
  });
}

export function isOnHighestPaidPlan(
  currentSlug: string | null | undefined,
  plans: PlanFromAPI[],
): boolean {
  if (!currentSlug) return false;
  const highest = findHighestPaidPlan(plans);
  if (!highest) return false;
  return highest.slug.toLowerCase() === currentSlug.toLowerCase();
}
