export type LabSpecsStep = {
  id?: unknown
  title?: unknown
  hint?: unknown
  expected?: unknown
  testFile?: unknown
  tests?: unknown
}

export type LabSpecs = {
  template?: unknown
  files?: unknown
  steps?: unknown
}

export type ValidateLabSpecsResult = {
  ok: boolean
  errors: string[]
  warnings: string[]
  parsed?: LabSpecs
}

const JSON_ESCAPE_HINT =
  'Em regex no testFile, escape barras no JSON: \\\\. \\\\s \\\\( etc.'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Parse + checagens semânticas leves do blob lab_specs.
 * Única fonte de verdade para botão Validar e save do modal.
 */
export function validateLabSpecs(raw: string): ValidateLabSpecsResult {
  const errors: string[] = []
  const warnings: string[] = []

  const trimmed = (raw ?? '').trim()
  if (!trimmed) {
    return {
      ok: false,
      errors: ['Specs vazias. Cole um JSON com files, template e steps.'],
      warnings,
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      ok: false,
      errors: [`JSON inválido: ${msg}. ${JSON_ESCAPE_HINT}`],
      warnings,
    }
  }

  if (!isPlainObject(parsed)) {
    return {
      ok: false,
      errors: ['Specs devem ser um objeto JSON (não array/primitivo).'],
      warnings,
    }
  }

  const specs = parsed as LabSpecs

  let template: 'react' | 'vanilla' = 'react'
  if (specs.template == null || specs.template === '') {
    warnings.push('template ausente — assumindo "react".')
  } else if (specs.template === 'react' || specs.template === 'vanilla') {
    template = specs.template
  } else {
    errors.push('template deve ser "react" ou "vanilla".')
  }

  if (!isPlainObject(specs.files)) {
    errors.push('files deve ser um objeto (ex.: { "/App.js": "..." }).')
  } else {
    const files = specs.files as Record<string, unknown>
    const entry = template === 'vanilla' ? '/index.js' : '/App.js'
    if (!(entry in files) || !isNonEmptyString(files[entry])) {
      errors.push(
        `files deve incluir o entry point "${entry}" (string não vazia) para template "${template}".`,
      )
    }
  }

  if (!Array.isArray(specs.steps)) {
    errors.push('steps deve ser um array.')
  } else if (specs.steps.length === 0) {
    errors.push('steps não pode ser vazio.')
  } else {
    const seenIds = new Set<string>()
    specs.steps.forEach((rawStep, index) => {
      const label = `steps[${index}]`
      if (!isPlainObject(rawStep)) {
        errors.push(`${label} deve ser um objeto.`)
        return
      }
      const step = rawStep as LabSpecsStep

      if (!isNonEmptyString(step.id)) {
        errors.push(`${label}: id é obrigatório (string).`)
      } else if (seenIds.has(step.id.trim())) {
        errors.push(`${label}: id duplicado "${step.id.trim()}".`)
      } else {
        seenIds.add(step.id.trim())
      }

      if (!isNonEmptyString(step.title)) {
        errors.push(`${label}: title é obrigatório (string).`)
      }

      const hasTestFile = isNonEmptyString(step.testFile)
      const hasTests =
        isPlainObject(step.tests) &&
        Object.keys(step.tests as Record<string, unknown>).length > 0

      if (!hasTestFile && !hasTests) {
        errors.push(
          `${label}: informe testFile (string) ou tests (objeto path → conteúdo).`,
        )
      }

      if (
        step.expected == null ||
        (typeof step.expected === 'string' && !step.expected.trim())
      ) {
        warnings.push(
          `${label}: expected vazio — recomendado para feedback amigável no Verificar.`,
        )
      }

      if (template === 'vanilla' && hasTestFile) {
        const tf = String(step.testFile)
        if (/['"`]\/App\.js['"`]/.test(tf)) {
          warnings.push(
            `${label}: testFile referencia /App.js com template vanilla — use /index.js (labRespectTemplate).`,
          )
        }
      }
    })
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    parsed: errors.length === 0 ? specs : undefined,
  }
}
