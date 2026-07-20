/**
 * Funções puras para asserts de lab (estilo Codecademy).
 * Testáveis no Node; a mesma lógica é embutida em /lab-test-helpers.js no Sandpack.
 */

export const STUDENT_CODE_ALLOWLIST = ['/App.js', '/index.js'] as const

export const MAX_STUDENT_CODE_BYTES = 512 * 1024

export type DeclKeyword = 'var' | 'let' | 'const'

export function resolveStudentCodePath(
  path?: string | null,
): (typeof STUDENT_CODE_ALLOWLIST)[number] {
  const normalized = (path ?? '/App.js').trim()
  const withSlash = normalized.startsWith('/')
    ? normalized
    : `/${normalized}`
  if (
    !(STUDENT_CODE_ALLOWLIST as readonly string[]).includes(withSlash)
  ) {
    throw new Error(
      `Path não permitido: \`${withSlash}\`. Use apenas /App.js ou /index.js.`,
    )
  }
  return withSlash as (typeof STUDENT_CODE_ALLOWLIST)[number]
}

/**
 * Substitui comentários e literais de string por espaços (preserva \\n),
 * para regex de keyword / console.log não casarem em texto inerte.
 */
export function stripStringsAndComments(source: string): string {
  let out = ''
  let i = 0
  const len = source.length

  const pushSpace = (ch: string) => {
    out += ch === '\n' ? '\n' : ' '
  }

  while (i < len) {
    const c = source[i]
    const n = source[i + 1]

    if (c === '/' && n === '/') {
      pushSpace(c)
      pushSpace(n)
      i += 2
      while (i < len && source[i] !== '\n') {
        pushSpace(source[i])
        i += 1
      }
      continue
    }

    if (c === '/' && n === '*') {
      pushSpace(c)
      pushSpace(n)
      i += 2
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
        pushSpace(source[i])
        i += 1
      }
      if (i < len) {
        pushSpace(source[i])
        pushSpace(source[i + 1] ?? '')
        i += 2
      }
      continue
    }

    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      pushSpace(c)
      i += 1
      while (i < len) {
        if (source[i] === '\\') {
          pushSpace(source[i])
          if (i + 1 < len) {
            pushSpace(source[i + 1])
            i += 2
            continue
          }
          i += 1
          break
        }
        if (source[i] === quote) {
          pushSpace(source[i])
          i += 1
          break
        }
        // template: skip ${ ... } roughly by nesting
        if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
          pushSpace(source[i])
          pushSpace(source[i + 1])
          i += 2
          let depth = 1
          while (i < len && depth > 0) {
            if (source[i] === '{') depth += 1
            else if (source[i] === '}') depth -= 1
            pushSpace(source[i])
            i += 1
          }
          continue
        }
        pushSpace(source[i])
        i += 1
      }
      continue
    }

    out += c
    i += 1
  }

  return out
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Verifica se `name` é declarado com a keyword dada (inclui multi-decl:
 * `var a = 1, numOfSlices = 8`).
 */
export function hasKeywordBinding(
  source: string,
  keyword: DeclKeyword,
  name: string,
): boolean {
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return false
  const cleaned = stripStringsAndComments(source)
  const declRe = new RegExp(`\\b${keyword}\\b\\s+([^;]+)`, 'g')
  let match: RegExpExecArray | null
  while ((match = declRe.exec(cleaned))) {
    const parts = match[1].split(',')
    for (const part of parts) {
      const id = part.trim().match(/^([A-Za-z_$][\w$]*)/)
      if (id && id[1] === name) return true
    }
  }
  return false
}

/** `console.log(argName)` no código ativo (não em string/comentário). */
export function hasConsoleLogArg(source: string, argName: string): boolean {
  if (!/^[A-Za-z_$][\w$]*$/.test(argName)) return false
  const cleaned = stripStringsAndComments(source)
  const re = new RegExp(
    `\\bconsole\\s*\\.\\s*log\\s*\\(\\s*${escapeRegExp(argName)}\\s*\\)`,
  )
  return re.test(cleaned)
}

/**
 * Conta `console.log(` no código ativo (ignora strings e comentários).
 * Use isto em vez de `code.split('console.log(')` — o starter costuma citar
 * console.log() nos comentários.
 */
export function countConsoleLogCalls(source: string): number {
  const cleaned = stripStringsAndComments(source)
  const re = /\bconsole\s*\.\s*log\s*\(/g
  let n = 0
  while (re.exec(cleaned)) n += 1
  return n
}

/** Assert: exige pelo menos `min` chamadas reais a console.log(...). */
export function assertConsoleLogCount(source: string, min: number): void {
  const n = countConsoleLogCalls(source)
  if (n < min) {
    throw new Error(
      min === 1
        ? 'Did you use console.log() at least once?'
        : `Did you use console.log() at least ${min} times? Found ${n}.`,
    )
  }
}

export function assertCodeSize(byteLength: number): void {
  if (byteLength > MAX_STUDENT_CODE_BYTES) {
    throw new Error(
      `Arquivo do aluno excede o limite de ${MAX_STUDENT_CODE_BYTES} bytes.`,
    )
  }
}

/** Remove espaços/newlines — para comparar código ignorando formatação. */
export function compactCode(source: string): string {
  return String(source).replace(/\s+/g, '')
}

/** Variantes com aspas simples ↔ duplas (quando houver). */
export function quoteVariants(snippet: string): string[] {
  const s = String(snippet)
  const set = new Set<string>([s])
  if (s.includes("'")) set.add(s.replace(/'/g, '"'))
  if (s.includes('"')) set.add(s.replace(/"/g, "'"))
  return [...set]
}

/**
 * true se o fonte contém o trecho, ignorando espaços, `;` e aspas ' vs ".
 * Ex.: `console.log(3+4)` casa `console.log(3 + 4);` e aspas equivalentes.
 */
export function sourceContainsLoose(source: string, needle: string): boolean {
  const hay = compactCode(source).replace(/;/g, '')
  for (const variant of quoteVariants(needle)) {
    const n = compactCode(variant).replace(/;/g, '')
    if (n.length > 0 && hay.includes(n)) return true
  }
  return false
}

/** Assert Jest-friendly: falha se o trecho não estiver no código (forma flexível). */
export function assertCodeContains(source: string, needle: string): void {
  if (!sourceContainsLoose(source, needle)) {
    const display = String(needle).replace(/\s+/g, ' ').trim()
    throw new Error(
      `Did you include \`${display}\` in your code? (spaces and quote style do not matter)`,
    )
  }
}
