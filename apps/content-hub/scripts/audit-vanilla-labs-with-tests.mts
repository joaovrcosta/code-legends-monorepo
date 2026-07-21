/**
 * Batch audit: labs template=vanilla com testes, sob labRespectTemplate.
 *
 * Uso:
 *   node --experimental-strip-types scripts/audit-vanilla-labs-with-tests.mts path/to/labs.json
 *
 * labs.json = array de { lessonId?, title?, specs } ou { lessonId?, title?, lab_specs }
 * Também aceita um único objeto specs.
 *
 * Rode ANTES de ligar NEXT_PUBLIC_LAB_RESPECT_TEMPLATE=true em %.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  auditVanillaLabRespectTemplate,
  summarizeVanillaLabAudits,
  type VanillaLabAuditResult,
} from '../lib/audit-vanilla-lab-respect-template.ts'

function hasTests(specs: unknown): boolean {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return false
  const steps = (specs as { steps?: unknown }).steps
  if (!Array.isArray(steps)) return false
  return steps.some((step) => {
    if (!step || typeof step !== 'object') return false
    const s = step as { testFile?: unknown; tests?: unknown }
    if (typeof s.testFile === 'string' && s.testFile.trim()) return true
    if (s.tests && typeof s.tests === 'object' && !Array.isArray(s.tests)) {
      return Object.keys(s.tests).length > 0
    }
    return false
  })
}

function normalizeEntries(raw: unknown): Array<{
  lessonId?: number | string
  title?: string
  specs: unknown
}> {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (!item || typeof item !== 'object') {
        return { specs: item }
      }
      const row = item as Record<string, unknown>
      return {
        lessonId: row.lessonId as number | string | undefined,
        title: typeof row.title === 'string' ? row.title : undefined,
        specs: row.specs ?? row.lab_specs ?? row,
      }
    })
  }
  if (raw && typeof raw === 'object') {
    const row = raw as Record<string, unknown>
    if ('specs' in row || 'lab_specs' in row || 'template' in row) {
      return [
        {
          lessonId: row.lessonId as number | string | undefined,
          title: typeof row.title === 'string' ? row.title : undefined,
          specs: row.specs ?? row.lab_specs ?? row,
        },
      ]
    }
  }
  return [{ specs: raw }]
}

function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error(
      'Uso: node --experimental-strip-types scripts/audit-vanilla-labs-with-tests.mts <labs.json>',
    )
    console.error(
      'Exporte labs publicados (template vanilla + testes) e passe o JSON aqui antes do rollout da flag.',
    )
    process.exit(1)
  }

  const path = resolve(process.cwd(), arg)
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown
  const entries = normalizeEntries(raw)

  const results: VanillaLabAuditResult[] = []
  for (const entry of entries) {
    const specs = entry.specs
    if (
      !specs ||
      typeof specs !== 'object' ||
      (specs as { template?: unknown }).template !== 'vanilla' ||
      !hasTests(specs)
    ) {
      continue
    }
    results.push(
      auditVanillaLabRespectTemplate(specs, {
        lessonId: entry.lessonId,
        title: entry.title,
      }),
    )
  }

  const summary = summarizeVanillaLabAudits(results)
  console.log(
    JSON.stringify(
      {
        totalVanillaWithTests: summary.totalVanillaWithTests,
        ok: summary.ok,
        breaking: summary.breaking.length,
        report: summary.breaking,
      },
      null,
      2,
    ),
  )

  if (summary.breaking.length > 0) {
    console.error(
      `\n${summary.breaking.length} lab(s) vanilla+testes precisam de correção de conteúdo antes de ligar labRespectTemplate.`,
    )
    process.exit(2)
  }

  console.error(
    `\nOK: ${summary.ok} lab(s) vanilla+testes sem issues óbvias sob o novo runtime.`,
  )
}

main()
