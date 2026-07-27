import { describe, expect, it } from "vitest";
import type { PlanFromAPI } from "@/actions/plan/list-plans";
import {
  canUserUpgrade,
  findHighestPaidPlan,
  isOnHighestPaidPlan,
} from "./plan-utils";

function plan(
  overrides: Partial<PlanFromAPI> & Pick<PlanFromAPI, "slug" | "order" | "amountCents">,
): PlanFromAPI {
  return {
    id: overrides.id ?? overrides.slug,
    name: overrides.name ?? overrides.slug,
    description: overrides.description ?? null,
    active: overrides.active ?? true,
    externalId: overrides.externalId ?? null,
    productName: overrides.productName ?? null,
    createdAt: overrides.createdAt ?? "2024-01-01",
    updatedAt: overrides.updatedAt ?? "2024-01-01",
    ...overrides,
  };
}

const pro = plan({ slug: "pro", order: 1, amountCents: 9900 });
const premium = plan({ slug: "premium", order: 2, amountCents: 19900 });
const paidPlans = [pro, premium];

describe("findHighestPaidPlan", () => {
  it("escolhe o maior order; empate por amountCents", () => {
    expect(findHighestPaidPlan(paidPlans)?.slug).toBe("premium");
  });

  it("ignora planos inativos e amountCents 0", () => {
    expect(
      findHighestPaidPlan([
        plan({ slug: "free", order: 0, amountCents: 0 }),
        plan({ slug: "old", order: 9, amountCents: 5000, active: false }),
        pro,
      ])?.slug,
    ).toBe("pro");
  });

  it("retorna null quando não há planos pagos ativos", () => {
    expect(
      findHighestPaidPlan([plan({ slug: "free", order: 0, amountCents: 0 })]),
    ).toBeNull();
  });
});

describe("isOnHighestPaidPlan / canUserUpgrade", () => {
  it("planSlug null (FREE / sem plano ativo / pós-endsAt já degradado pela API) → pode upgrade", () => {
    expect(isOnHighestPaidPlan(null, paidPlans)).toBe(false);
    expect(canUserUpgrade(null, paidPlans)).toBe(true);
  });

  it("trata planSlug undefined defensivamente, embora o contrato da API garanta null", () => {
    expect(isOnHighestPaidPlan(undefined, paidPlans)).toBe(false);
    expect(canUserUpgrade(undefined, paidPlans)).toBe(true);
  });

  it("plano intermediário → pode upgrade", () => {
    expect(canUserUpgrade("pro", paidPlans)).toBe(true);
    expect(isOnHighestPaidPlan("pro", paidPlans)).toBe(false);
  });

  it("plano máximo → não pode upgrade", () => {
    expect(canUserUpgrade("premium", paidPlans)).toBe(false);
    expect(isOnHighestPaidPlan("premium", paidPlans)).toBe(true);
  });

  it("compara slug case-insensitive", () => {
    expect(canUserUpgrade("PREMIUM", paidPlans)).toBe(false);
    expect(canUserUpgrade("Pro", paidPlans)).toBe(true);
  });

  it("lista sem planos pagos → não está no highest; pode upgrade", () => {
    expect(isOnHighestPaidPlan("pro", [])).toBe(false);
    expect(canUserUpgrade("pro", [])).toBe(true);
  });

  it("trial de plano pago se comporta como esse plano, sem tratamento especial", () => {
    // Trial não tem flag no gate: se a API devolver o slug do plano, a regra é só por slug.
    expect(canUserUpgrade("pro", paidPlans)).toBe(true);
    expect(canUserUpgrade("premium", paidPlans)).toBe(false);
  });
});
