/**
 * Utilitários de persistência de código do lab no client
 * (espelha regras da API / lab-test-helpers).
 */
import { stripLabAutoExports } from '@/lib/lab/lab-auto-exports'
import { STUDENT_CODE_PATHS } from '@/components/classroom/lab/lab-playground/constants'

const ALLOWLIST = new Set<string>(STUDENT_CODE_PATHS)

export function pickStudentWorkspaceFiles(
  files: Record<string, { code?: string } | string | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const path of ALLOWLIST) {
    const entry = files[path]
    const code =
      typeof entry === 'string'
        ? entry
        : typeof entry?.code === 'string'
          ? entry.code
          : null
    if (code == null) continue
    out[path] = stripLabAutoExports(code)
  }
  return out
}

/** Mescla starter editorial com workspace salvo (só allowlist). */
export function mergeLabStarterWithWorkspace(
  starter: Record<string, string> | undefined,
  workspace: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!workspace || Object.keys(workspace).length === 0) return starter
  const base = { ...(starter ?? {}) }
  for (const [path, code] of Object.entries(workspace)) {
    if (!ALLOWLIST.has(path)) continue
    base[path] = stripLabAutoExports(code)
  }
  return base
}
