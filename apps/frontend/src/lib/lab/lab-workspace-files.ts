/**
 * Utilitários de persistência de código do lab no client
 * (espelha regras da API / lab-test-helpers).
 */
import { stripLabAutoExports } from '@/lib/lab/lab-auto-exports'
import { STUDENT_CODE_PATHS } from '@/components/classroom/lab/lab-playground/constants'

const ALLOWLIST = new Set<string>(STUDENT_CODE_PATHS)

function readFileCode(
  files: Record<string, { code?: string } | string | undefined>,
  path: string,
): string | null {
  const entry = files[path]
  if (typeof entry === 'string') return entry
  if (typeof entry?.code === 'string') return entry.code
  return null
}

/**
 * Snapshot do código do aluno para workspace/attempts.
 * React: aluno edita `/App.js`; `/index.js` é bootstrap oculto — não persistir.
 */
export function pickStudentWorkspaceFiles(
  files: Record<string, { code?: string } | string | undefined>,
): Record<string, string> {
  const hasAppJs = readFileCode(files, '/App.js') != null
  const out: Record<string, string> = {}
  for (const path of ALLOWLIST) {
    if (path === '/index.js' && hasAppJs) continue
    const code = readFileCode(files, path)
    if (code == null) continue
    out[path] = stripLabAutoExports(code)
  }
  return out
}

/**
 * Mescla starter editorial com workspace salvo (só allowlist).
 * Com `/App.js` presente (lab react), ignora `/index.js` do workspace —
 * costuma ser bootstrap Sandpack salvo por engano.
 */
export function mergeLabStarterWithWorkspace(
  starter: Record<string, string> | undefined,
  workspace: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!workspace || Object.keys(workspace).length === 0) return starter
  const base = { ...(starter ?? {}) }
  const hasAppJs =
    Object.prototype.hasOwnProperty.call(workspace, '/App.js') ||
    Object.prototype.hasOwnProperty.call(base, '/App.js')
  for (const [path, code] of Object.entries(workspace)) {
    if (!ALLOWLIST.has(path)) continue
    if (path === '/index.js' && hasAppJs) continue
    base[path] = stripLabAutoExports(code)
  }
  return base
}
