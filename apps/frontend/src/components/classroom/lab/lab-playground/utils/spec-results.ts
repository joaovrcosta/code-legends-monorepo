import type { SpecsMap } from '../types'

export function getSpecFileError(specs: SpecsMap): string | null {
  for (const spec of Object.values(specs ?? {})) {
    if (!spec.error) continue
    if (typeof spec.error === 'string') return spec.error
    if (spec.error.message) return spec.error.message
    return String(spec.error)
  }
  return null
}

export function countSpecResults(specs: SpecsMap): {
  passed: number
  total: number
  failed: number
} {
  let passed = 0
  let failed = 0
  let total = 0

  const walkTests = (tests?: Record<string, { status?: string }>) => {
    if (!tests) return
    for (const t of Object.values(tests)) {
      total += 1
      if (t.status === 'pass') passed += 1
      else if (t.status === 'fail') failed += 1
    }
  }

  const walkDescribes = (describes?: Record<string, unknown>) => {
    if (!describes) return
    for (const d of Object.values(describes) as Array<{
      tests?: Record<string, { status?: string }>
      describes?: Record<string, unknown>
    }>) {
      walkTests(d.tests)
      walkDescribes(d.describes)
    }
  }

  for (const spec of Object.values(specs ?? {})) {
    if (spec.error) failed += 1
    walkTests(spec.tests)
    walkDescribes(spec.describes as Record<string, unknown> | undefined)
  }

  return { passed, total, failed }
}
