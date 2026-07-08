const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos para exibição com máscara BRL (ex.: 19700 → "R$ 197,00"). */
export function formatCentsToBRLMask(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  return brlFormatter.format(safe / 100);
}

/** Extrai centavos a partir do texto digitado (aceita máscara ou só dígitos). */
export function parseBRLInputToCents(input: string): number {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}
