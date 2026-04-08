/**
 * Converte strings de duração de vídeo/aula para segundos.
 * Suporta "MM:SS", "HH:MM:SS" e "12m 30s" (igual ao roadmap).
 */
export function parseDurationToSeconds(duration: string | null | undefined): number {
  if (duration == null) return 0
  const trimmed = duration.trim()
  if (!trimmed) return 0

  const minutesSecondsMatch = trimmed.match(/(\d+)m\s*(\d+)s/)
  if (minutesSecondsMatch) {
    const minutes = parseInt(minutesSecondsMatch[1], 10)
    const seconds = parseInt(minutesSecondsMatch[2], 10)
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return minutes * 60 + seconds
    }
  }

  const parts = trimmed.split(':').map(Number)
  if (parts.length === 3 && parts.every((p) => !Number.isNaN(p))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2 && parts.every((p) => !Number.isNaN(p))) {
    return parts[0] * 60 + parts[1]
  }

  return 0
}
