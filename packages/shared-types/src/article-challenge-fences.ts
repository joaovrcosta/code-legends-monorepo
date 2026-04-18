/**
 * Extrai o JSON de cada bloco ```challenge / ~~~challenge no markdown do artigo,
 * na ordem documental. Usado para contar slots no servidor e para índices estáveis no cliente.
 */
export function extractChallengeFenceInnersFromArticleBody(
  body: string | null | undefined,
): string[] {
  if (!body) return []
  const out: string[] = []
  let cursor = 0

  const tryOpen = (
    text: string,
    start: number,
    ch: "`" | "~",
  ): { inner: string; end: number } | null => {
    const slice = text.slice(start)
    const esc = ch === "`" ? "`" : "~"
    const openRe =
      ch === "`"
        ? /^(`{3,})\s*challenge\b\s*(?:\r?\n|$)/im
        : /^(~{3,})\s*challenge\b\s*(?:\r?\n|$)/im
    const om = slice.match(openRe)
    if (!om) return null
    const tickCount = om[1].length
    const openLen = om[0].length
    const tail = text.slice(start + openLen)
    const closeRe = new RegExp(`\\r?\\n${esc.repeat(tickCount)}\\s*(?:\\r?\\n|$)`)
    const cm = closeRe.exec(tail)
    if (!cm || cm.index === undefined) return null
    const inner = tail.slice(0, cm.index).replace(/\r\n/g, "\n").trim()
    const end = start + openLen + cm.index + cm[0].length
    return { inner, end }
  }

  while (cursor < body.length) {
    const tick = tryOpen(body, cursor, "`")
    const tilde = tryOpen(body, cursor, "~")
    let pick: { inner: string; end: number } | null = null
    if (tick && tilde) pick = tick.end <= tilde.end ? tick : tilde
    else pick = tick ?? tilde

    if (pick) {
      out.push(pick.inner)
      cursor = pick.end
    } else {
      cursor += 1
    }
  }
  return out
}

/** Comparação tolerante a espaços em branco / ordem de chaves JSON. */
export function stableChallengeFencePayloadKey(raw: string): string {
  const t = raw.trim().replace(/\r\n/g, "\n")
  try {
    return JSON.stringify(JSON.parse(t))
  } catch {
    return t
  }
}
