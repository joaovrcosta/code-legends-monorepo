/**
 * Validação de arquivos de código do aluno (workspace / attempts).
 * Espelha allowlist e teto do frontend (lab-test-helpers-core).
 */

export const LAB_STUDENT_CODE_ALLOWLIST = ['/App.js', '/index.js'] as const

export const LAB_STUDENT_FILES_MAX_BYTES = 512 * 1024
/** Meta de steps (ids/índices) — budget separado do código. */
export const LAB_PROGRESS_META_MAX_BYTES = 32 * 1024

export const LAB_AUTO_EXPORT_MARKER = '/* __lab_auto_exports__ */'

export class LabStudentFilesValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LabStudentFilesValidationError'
  }
}

export function stripLabAutoExports(code: string): string {
  const idx = code.indexOf(LAB_AUTO_EXPORT_MARKER)
  if (idx === -1) {
    // Espelho .__lab_check não deve ser persistido; strip export órfão no fim.
    return code
      .replace(/\nexport\s*\{\s*[^}]*\s*\}\s*;?\s*$/m, '\n')
      .replace(/^\s*export\s*\{\s*\}\s*;?\s*$/m, '')
  }
  return code.slice(0, idx).replace(/\s+$/, '\n')
}

function normalizeStudentPath(path: string): string {
  const trimmed = path.trim()
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function utf8ByteLength(value: string): number {
  return Buffer.byteLength(value, 'utf8')
}

/**
 * Valida e normaliza Record path→code (allowlist + strip + teto 512 KiB).
 */
export function sanitizeLabStudentFiles(
  raw: unknown,
): Record<string, string> {
  if (raw == null) return {}
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new LabStudentFilesValidationError(
      'files deve ser um objeto path → código.',
    )
  }

  const out: Record<string, string> = {}
  let totalBytes = 0

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const path = normalizeStudentPath(key)
    if (
      !(LAB_STUDENT_CODE_ALLOWLIST as readonly string[]).includes(path) ||
      path.endsWith('.__lab_check.js') ||
      /\.(test|spec)\.[tj]sx?$/i.test(path) ||
      path.includes('lab-test-helpers')
    ) {
      throw new LabStudentFilesValidationError(
        `Path não permitido: \`${path}\`. Use apenas /App.js ou /index.js.`,
      )
    }
    if (typeof value !== 'string') {
      throw new LabStudentFilesValidationError(
        `Conteúdo de \`${path}\` deve ser string.`,
      )
    }
    const code = stripLabAutoExports(value)
    totalBytes += utf8ByteLength(code)
    if (totalBytes > LAB_STUDENT_FILES_MAX_BYTES) {
      throw new LabStudentFilesValidationError(
        `Código do aluno excede o limite de ${LAB_STUDENT_FILES_MAX_BYTES} bytes.`,
      )
    }
    out[path] = code
  }

  return out
}

export function assertLabProgressMetaSize(meta: {
  completedStepIds: string[]
  currentStepId: string
  completedCount?: number
  currentStepIndex?: number
}): void {
  if (meta.completedStepIds.length > 500) {
    throw new LabStudentFilesValidationError(
      'completedStepIds excede o limite permitido.',
    )
  }
  const serialized = JSON.stringify({
    completedStepIds: meta.completedStepIds,
    currentStepId: meta.currentStepId,
    completedCount: meta.completedCount,
    currentStepIndex: meta.currentStepIndex,
  })
  if (utf8ByteLength(serialized) > LAB_PROGRESS_META_MAX_BYTES) {
    throw new LabStudentFilesValidationError(
      `Metadados de progresso excedem ${LAB_PROGRESS_META_MAX_BYTES} bytes.`,
    )
  }
}
