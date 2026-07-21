import { LAB_TEST_HELPERS_PATH } from '@/lib/lab/lab-test-helpers-source'
import { DEFAULT_TEST_PATH } from '../constants'
import type { SandpackFileInput } from '../types'

/** Path único por step — evita Jest/Sandpack reusar o testFile do passo anterior. */
export function stepTestPath(stepId: string): string {
  const safe = String(stepId).replace(/[^a-zA-Z0-9_-]/g, '_') || 'step'
  return `/lab.step.${safe}.test.js`
}

export function isManagedLabStepTestPath(path: string): boolean {
  return (
    path === DEFAULT_TEST_PATH ||
    /^\/lab\.step\.[^/]+\.test\.[tj]sx?$/i.test(path)
  )
}

export function resolveTestFiles(
  activeTests: {
    testFile?: string
    tests?: Record<string, string>
  },
  stepId: string,
): Record<string, string> {
  if (activeTests.tests && Object.keys(activeTests.tests).length > 0) {
    return activeTests.tests
  }
  if (typeof activeTests.testFile === 'string' && activeTests.testFile.trim()) {
    // Comentário de geração força rebundle se o conteúdo coincidir entre steps.
    const body = `/* lab-step:${stepId} */\n${activeTests.testFile}`
    return { [stepTestPath(stepId)]: body }
  }
  return {}
}

export function isTestFilePath(path: string): boolean {
  return (
    isManagedLabStepTestPath(path) ||
    path === LAB_TEST_HELPERS_PATH ||
    /\.(test|spec)\.[tj]sx?$/i.test(path)
  )
}

export function getEntryFile(template: 'vanilla' | 'react'): string {
  return template === 'react' ? '/App.js' : '/index.js'
}

export function getStudentVisibleFiles(
  template: 'vanilla' | 'react',
  contentFiles: Record<string, string> | undefined,
  sandboxPaths: string[],
): { entryFile: string; visibleFiles: string[] } {
  const entryFile = getEntryFile(template)
  const visible = new Set<string>()
  visible.add(entryFile)

  for (const path of Object.keys(contentFiles ?? {})) {
    if (isTestFilePath(path)) continue
    // No react, /index.js do autor vira /App.js; o bootstrap /index.js não é do aluno.
    if (template === 'react' && path === '/index.js') continue
    visible.add(path)
  }

  const sandboxSet = new Set(sandboxPaths)
  const visibleFiles = [...visible].filter(
    (path) => path === entryFile || sandboxSet.has(path),
  )

  return {
    entryFile,
    visibleFiles: visibleFiles.length > 0 ? visibleFiles : [entryFile],
  }
}

/** Paths do sandbox que não devem aparecer no explorer/abas. */
export function getHiddenFilePaths(
  sandboxPaths: string[],
  visibleFiles: string[],
): string[] {
  const visible = new Set(visibleFiles)
  return sandboxPaths.filter((path) => !visible.has(path))
}

/**
 * Marca arquivos internos como hidden.
 * Esta versão do sandpack-react não tem options.hiddenFiles; usamos file.hidden
 * + options.visibleFiles (lista = getStudentVisibleFiles).
 */
export function applyHiddenFlags(
  files: Record<string, string>,
  visibleFiles: string[],
): Record<string, SandpackFileInput> {
  const hiddenPaths = new Set(
    getHiddenFilePaths(Object.keys(files), visibleFiles),
  )
  const out: Record<string, SandpackFileInput> = {}
  for (const [path, code] of Object.entries(files)) {
    out[path] = hiddenPaths.has(path) ? { code, hidden: true } : code
  }
  return out
}
