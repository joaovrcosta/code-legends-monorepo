/** Converte curtidas/descurtidas em nota média de 0 a 5 (curtida = 5, descurtida = 0). */
export function computeReactionAverageRating(
  likes: number,
  dislikes: number,
): number | null {
  const ratingCount = likes + dislikes;
  if (ratingCount === 0) return null;

  const average = (likes / ratingCount) * 5;
  return Math.round(average * 10) / 10;
}
