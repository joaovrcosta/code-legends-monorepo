/**
 * Máscara de duração de vídeo: só dígitos, no máximo 6 (hh mm ss em pares).
 * Interpretação alinhada à direita (como digitar de trás para frente no relógio):
 * - 1–2 dígitos: segundos (0–59); ex. 5 → "5", 53 → "00:53"
 * - 3–4 dígitos: mm:ss; minutos e segundos com 2 dígitos; segundos limitados a 0–59
 * - 5–6 dígitos: hh:mm:ss; horas sem limite (até 99 com 6 dígitos); mm e ss limitados a 0–59
 */
export function formatVideoDurationMask(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 6);
  if (!d) return "";

  if (d.length <= 2) {
    if (d.length === 1) return d;
    let sec = parseInt(d, 10);
    if (Number.isNaN(sec)) sec = 0;
    sec = Math.min(59, sec);
    return `00:${String(sec).padStart(2, "0")}`;
  }

  if (d.length <= 4) {
    const secRaw = d.slice(-2);
    let sec = parseInt(secRaw, 10);
    if (Number.isNaN(sec)) sec = 0;
    sec = Math.min(59, sec);
    const min = parseInt(d.slice(0, -2), 10);
    const minSafe = Number.isNaN(min) ? 0 : min;
    return `${String(minSafe).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  const secRaw = d.slice(-2);
  let sec = parseInt(secRaw, 10);
  if (Number.isNaN(sec)) sec = 0;
  sec = Math.min(59, sec);

  const minRaw = d.slice(-4, -2);
  let min = parseInt(minRaw, 10);
  if (Number.isNaN(min)) min = 0;
  min = Math.min(59, min);

  const hourRaw = d.slice(0, -4);
  const hours = parseInt(hourRaw, 10);
  const hoursSafe = Number.isNaN(hours) ? 0 : hours;

  return `${String(hoursSafe).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
