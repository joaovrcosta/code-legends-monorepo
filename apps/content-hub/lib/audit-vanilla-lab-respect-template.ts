/**
 * Audit de labs vanilla + testes antes de ligar labRespectTemplate.
 * Simula entry /index.js, helpers default /index.js, sem forçar React.
 */

export type VanillaLabAuditIssue = {
  code:
    | 'refs_app_js'
    | 'jsx_without_react_deps'
    | 'missing_index_js'
    | 'imports_react'
  message: string
  stepId?: string
}

export type VanillaLabAuditResult = {
  lessonId?: number | string
  title?: string
  ok: boolean
  issues: VanillaLabAuditIssue[]
}

type LabStep = {
  id?: unknown
  testFile?: unknown
  tests?: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectTestSources(step: LabStep): string[] {
  const out: string[] = []
  if (typeof step.testFile === 'string' && step.testFile.trim()) {
    out.push(step.testFile)
  }
  if (isPlainObject(step.tests)) {
    for (const code of Object.values(step.tests)) {
      if (typeof code === 'string' && code.trim()) out.push(code)
    }
  }
  return out
}

function stepHasTests(step: LabStep): boolean {
  return collectTestSources(step).length > 0
}

/**
 * Avalia um lab_specs com template vanilla + testes sob o novo comportamento
 * (respeitar template, entry /index.js, default helper /index.js).
 */
export function auditVanillaLabRespectTemplate(
  specs: unknown,
  meta?: { lessonId?: number | string; title?: string },
): VanillaLabAuditResult {
  const issues: VanillaLabAuditIssue[] = []
  const base = {
    lessonId: meta?.lessonId,
    title: meta?.title,
  }

  if (!isPlainObject(specs)) {
    return {
      ...base,
      ok: false,
      issues: [
        {
          code: 'missing_index_js',
          message: 'specs inválidas (não é objeto).',
        },
      ],
    }
  }

  if (specs.template !== 'vanilla') {
    return { ...base, ok: true, issues: [] }
  }

  const files = isPlainObject(specs.files)
    ? (specs.files as Record<string, unknown>)
    : {}
  const indexCode =
    typeof files['/index.js'] === 'string' ? files['/index.js'] : ''
  const appCode =
    typeof files['/App.js'] === 'string' ? files['/App.js'] : ''

  if (!indexCode.trim()) {
    issues.push({
      code: 'missing_index_js',
      message:
        'template vanilla sem /index.js — com labRespectTemplate o entry será /index.js.',
    })
  }

  const studentSources = [indexCode, appCode].filter(Boolean)
  for (const src of studentSources) {
    if (/<[A-Za-z]/.test(src) && !/from\s+['"]react['"]/.test(src)) {
      issues.push({
        code: 'jsx_without_react_deps',
        message:
          'JSX detectado em files sem import de react — vanilla sem bootstrap React vai quebrar.',
      })
      break
    }
    if (/from\s+['"]react['"]/.test(src) || /require\(['"]react['"]\)/.test(src)) {
      issues.push({
        code: 'imports_react',
        message:
          'files importam react com template vanilla — antes o force-react mascarava isso.',
      })
      break
    }
  }

  const steps = Array.isArray(specs.steps) ? specs.steps : []
  let anyTests = false
  for (const raw of steps) {
    if (!isPlainObject(raw)) continue
    const step = raw as LabStep
    if (!stepHasTests(step)) continue
    anyTests = true
    const stepId = typeof step.id === 'string' ? step.id : undefined
    for (const src of collectTestSources(step)) {
      if (
        /['"`]\/App\.js['"`]/.test(src) ||
        /readStudentCode\(\s*['"`]\/App\.js['"`]/.test(src) ||
        /readStudentCode\(\s*\)/.test(src) ||
        /softImportModule\(\s*\)/.test(src)
      ) {
        // readStudentCode() sem path agora defaulta /index.js no vanilla —
        // só flag se referencia /App.js explicitamente ou assume App via path omitido
        // quando o starter real é index (comum em labs que dependiam do force).
        if (/['"`]\/App\.js['"`]/.test(src)) {
          issues.push({
            code: 'refs_app_js',
            stepId,
            message:
              'testFile referencia /App.js; com vanilla o aluno edita /index.js.',
          })
        } else if (
          (/readStudentCode\(\s*\)/.test(src) ||
            /softImportModule\(\s*\)/.test(src)) &&
          !indexCode.trim()
        ) {
          issues.push({
            code: 'refs_app_js',
            stepId,
            message:
              'helper sem path (antes default /App.js) e sem /index.js no starter.',
          })
        }
        break
      }
    }
  }

  if (!anyTests) {
    return { ...base, ok: true, issues: [] }
  }

  // Deduplicate by code+stepId+message
  const seen = new Set<string>()
  const unique = issues.filter((i) => {
    const key = `${i.code}|${i.stepId ?? ''}|${i.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    ...base,
    ok: unique.length === 0,
    issues: unique,
  }
}

export function summarizeVanillaLabAudits(
  results: VanillaLabAuditResult[],
): {
  totalVanillaWithTests: number
  breaking: VanillaLabAuditResult[]
  ok: number
} {
  const withIssues = results.filter((r) => r.issues.length > 0 || !r.ok)
  // Caller should only pass vanilla+tests; count those that were audited
  return {
    totalVanillaWithTests: results.length,
    breaking: withIssues.filter((r) => !r.ok),
    ok: results.filter((r) => r.ok).length,
  }
}
