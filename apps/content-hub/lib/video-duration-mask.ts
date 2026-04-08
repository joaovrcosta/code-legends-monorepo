/**
 * Formata apenas dígitos como duração de vídeo:
 * - até 4 dígitos: mm:ss (segundos limitados a 0–59)
 * - 5–6 dígitos: h:mm:ss (minutos e segundos 0–59)
 */
export function formatVideoDurationMask(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 6);
  if (!d) return "";

  if (d.length <= 2) return d;

  if (d.length <= 4) {
    const secRaw = d.slice(-2);
    let sec = parseInt(secRaw, 10);
    if (Number.isNaN(sec)) sec = 0;
    sec = Math.min(59, sec);
    const minPart = d.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
    return `${minPart}:${String(sec).padStart(2, "0")}`;
  }

  const secRaw = d.slice(-2);
  let sec = parseInt(secRaw, 10);
  if (Number.isNaN(sec)) sec = 0;
  sec = Math.min(59, sec);

  const minRaw = d.slice(-4, -2);
  let min = parseInt(minRaw, 10);
  if (Number.isNaN(min)) min = 0;
  min = Math.min(59, min);

  const hourPart = d.slice(0, -4).replace(/^0+(?=\d)/, "") || "0";
  return `${hourPart}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
