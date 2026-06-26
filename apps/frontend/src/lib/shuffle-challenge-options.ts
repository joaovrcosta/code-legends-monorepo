/** Fisher–Yates em cópia (não muta o array original). */
export function shuffleOptionList<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getChallengeDisplayOptions(
  options: string[],
  shuffleOptions?: boolean,
): string[] {
  if (!shuffleOptions || options.length <= 1) return options
  return shuffleOptionList(options)
}
