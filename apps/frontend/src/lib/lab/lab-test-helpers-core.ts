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

export function assertCodeSize(byteLength: number): void {
  if (byteLength > MAX_STUDENT_CODE_BYTES) {
    throw new Error(
      `Arquivo do aluno excede o limite de ${MAX_STUDENT_CODE_BYTES} bytes.`,
    )
  }
}
