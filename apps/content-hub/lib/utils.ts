import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gera um slug a partir de um título
 * Converte para minúsculas, remove acentos, substitui espaços por hífens
 * e remove caracteres especiais
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
}

/**
 * Reserva um slug único dentro de um conjunto já utilizado.
 * Se o slug base já existir, adiciona sufixo numérico (-2, -3, …).
 */
export function allocateUniqueSlug(baseSlug: string, used: Set<string>): string {
  const normalized = (baseSlug.trim() || "item").toLowerCase();
  let slug = normalized;
  let suffix = 2;

  while (used.has(slug)) {
    slug = `${normalized}-${suffix}`;
    suffix += 1;
  }

  used.add(slug);
  return slug;
}

/**
 * Reserva um título único dentro de um conjunto já utilizado (comparação case-insensitive).
 */
export function allocateUniqueTitle(baseTitle: string, used: Set<string>): string {
  const normalized = baseTitle.trim() || "Item";
  let title = normalized;
  let suffix = 2;

  while (used.has(title.toLowerCase())) {
    title = `${normalized} (${suffix})`;
    suffix += 1;
  }

  used.add(title.toLowerCase());
  return title;
}
