'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFileExplorer,
  useSandpack,
  useSandpackClient,
} from '@codesandbox/sandpack-react'
import { Folder, FolderOpen } from '@phosphor-icons/react'
import { Loader2 } from 'lucide-react'
import {
  LAB_TEST_HELPERS_PATH,
  buildLabTestHelpersSource,
} from '@/lib/lab/lab-test-helpers-source'

const DEFAULT_TEST_PATH = '/lab.step.test.js'
const CHECK_TIMEOUT_MS = 30000
const CLIENT_POLL_MS = 200
const CLIENT_MAX_ATTEMPTS = 50

type SpecsMap = Record<
  string,
  {
    tests?: Record<string, { status?: string; errors?: unknown[] }>
    describes?: Record<string, unknown>
    error?: { message?: string } | string
  }
>

type TestStatus = 'idle' | 'starting' | 'running' | 'complete'

type SandpackFileInput = string | { code: string; hidden?: boolean }

function resolveTestFiles(activeTests: {
  testFile?: string
  tests?: Record<string, string>
}): Record<string, string> {
  if (activeTests.tests && Object.keys(activeTests.tests).length > 0) {
    return activeTests.tests
  }
  if (typeof activeTests.testFile === 'string' && activeTests.testFile.trim()) {
    return { [DEFAULT_TEST_PATH]: activeTests.testFile }
  }
  return {}
}

function isTestFilePath(path: string): boolean {
  return (
    path === DEFAULT_TEST_PATH ||
    path === LAB_TEST_HELPERS_PATH ||
    /\.(test|spec)\.[tj]sx?$/i.test(path) ||
    /\/lab\.step\.test\.[tj]sx?$/i.test(path)
  )
}

function getEntryFile(template: 'vanilla' | 'react'): string {
  return template === 'react' ? '/App.js' : '/index.js'
}

/**
 * Arquivos que o aluno pode ver/abrir. Independente de filesOpen.
 * Testes e bootstrap React ficam de fora (e marcados hidden no sandbox).
 */
function getStudentVisibleFiles(
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
function getHiddenFilePaths(
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
function applyHiddenFlags(
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

function getSpecFileError(specs: SpecsMap): string | null {
  for (const spec of Object.values(specs ?? {})) {
    if (!spec.error) continue
    if (typeof spec.error === 'string') return spec.error
    if (spec.error.message) return spec.error.message
    return String(spec.error)
  }
  return null
}

function countSpecResults(specs: SpecsMap): {
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

const LAB_AUTO_EXPORT_MARKER = '/* __lab_auto_exports__ */'
const STUDENT_CODE_PATHS = ['/App.js', '/index.js'] as const

/** Remove bloco de export injetado só para os testes. */
function stripLabAutoExports(code: string): string {
  const idx = code.indexOf(LAB_AUTO_EXPORT_MARKER)
  if (idx === -1) return code
  return code.slice(0, idx).replace(/\s+$/, '\n')
}

function listTopLevelBindings(code: string): string[] {
  const names: string[] = []
  const declRe =
    /(?:^|[\n;])\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/g
  const fnRe = /(?:^|[\n;])\s*function\s+([A-Za-z_$][\w$]*)\s*\(/g
  let match: RegExpExecArray | null
  while ((match = declRe.exec(code))) names.push(match[1])
  while ((match = fnRe.exec(code))) names.push(match[1])
  return [...new Set(names)]
}

function listAlreadyExported(code: string): Set<string> {
  const exported = new Set<string>()
  for (const block of code.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of block[1].split(',')) {
      const raw = part.trim()
      if (!raw) continue
      const name = raw.split(/\s+as\s+/)[0]?.trim()
      if (name) exported.add(name)
    }
  }
  const named =
    /export\s+(?:default\s+)?(?:async\s+)?(?:var|let|const|function|class)\s+([A-Za-z_$][\w$]*)/g
  let match: RegExpExecArray | null
  while ((match = named.exec(code))) exported.add(match[1])
  return exported
}

/**
 * Labs estilo Codecademy não pedem export; os testes importam ./App.js.
 * Injetamos export temporário das bindings top-level e restauramos depois.
 */
function withLabAutoExports(code: string): string {
  const base = stripLabAutoExports(code)
    .replace(/\nexport\s*\{\s*\}\s*;?\s*$/m, '\n')
    .replace(/^\s*export\s*\{\s*\}\s*;?\s*$/m, '')
  const declared = listTopLevelBindings(base)
  const already = listAlreadyExported(base)
  const missing = declared.filter((name) => !already.has(name))
  if (missing.length === 0) return base
  return `${base.trimEnd()}\n${LAB_AUTO_EXPORT_MARKER}\nexport { ${missing.join(', ')} };\n`
}

function SyncStepTests({
  stepId,
  testFiles,
}: {
  stepId: string
  testFiles: Record<string, string>
}) {
  // Troca só o arquivo de teste do step; ortogonal ao FileExplorer (visibleFiles
  // filtrada). Se Plano C (dois providers) existir, manter SyncStepTests no
  // provider ativo junto com filesOpen/activeFile.
  const { sandpack } = useSandpack()
  const prevStepRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevStepRef.current === stepId) return
    prevStepRef.current = stepId

    const entries = Object.entries(testFiles)
    if (entries.length === 0) return

    for (const [path, code] of entries) {
      try {
        sandpack.updateFile(path, code)
      } catch {
        // ignore
      }
    }
  }, [sandpack, stepId, testFiles])

  return null
}

/**
 * Runner Jest no mesmo padrão do SandpackTests (useSandpackClient),
 * mas só dispara run-all-tests quando o client existe — evita o stuck
 * em "running" sem onComplete.
 *
 * getClient/listen do Sandpack mudam de identidade a cada render; usamos
 * refs para não re-disparar effects (isso causava loop + erro de deps).
 */
function LabJestRunner({
  checkId,
  onComplete,
  onStatusChange,
}: {
  checkId: number
  onComplete: (specs: SpecsMap) => void
  onStatusChange: (status: TestStatus, specs: SpecsMap) => void
}) {
  const { getClient, iframe, listen } = useSandpackClient()
  const specsRef = useRef<SpecsMap>({})
  const jestReadyRef = useRef(false)
  const pendingCheckRef = useRef(false)
  const getClientRef = useRef(getClient)
  const listenRef = useRef(listen)
  const onCompleteRef = useRef(onComplete)
  const onStatusRef = useRef(onStatusChange)

  getClientRef.current = getClient
  listenRef.current = listen
  onCompleteRef.current = onComplete
  onStatusRef.current = onStatusChange

  const dispatchRunAll = useCallback(() => {
    const client = getClientRef.current()
    if (!client) return false
    specsRef.current = {}
    onStatusRef.current('running', {})
    client.dispatch({ type: 'run-all-tests' })
    return true
  }, [])

  useEffect(() => {
    // SandpackMessage é uma união larga; estreitar só no ramo type === 'test'.
    return listenRef.current((msg) => {
      const data = msg as {
        type?: string
        event?: string
        path?: string
        error?: SpecsMap[string]['error']
        test?: {
          path: string
          name: string
          status: string
          blocks?: string[]
          errors?: unknown[]
        }
      }
      if (data.type !== 'test') return
      const event = data.event

      if (event === 'initialize_tests') {
        jestReadyRef.current = true
        onStatusRef.current('idle', specsRef.current)
        if (pendingCheckRef.current) {
          pendingCheckRef.current = false
          dispatchRunAll()
        }
        return
      }

      if (event === 'total_test_start') {
        specsRef.current = {}
        onStatusRef.current('running', {})
        return
      }

      if (event === 'add_file' && data.path) {
        specsRef.current[data.path] = { tests: {}, describes: {} }
        return
      }

      if (event === 'file_error' && data.path) {
        const prev = specsRef.current[data.path] ?? { tests: {}, describes: {} }
        specsRef.current[data.path] = { ...prev, error: data.error }
        return
      }

      if (event === 'test_end' && data.test) {
        const test = data.test
        const path = test.path
        const name = [...(test.blocks ?? []), test.name].join(' › ')
        const prev = specsRef.current[path] ?? { tests: {}, describes: {} }
        specsRef.current[path] = {
          ...prev,
          tests: {
            ...(prev.tests ?? {}),
            [name]: { status: test.status, errors: test.errors },
          },
        }
        onStatusRef.current('running', { ...specsRef.current })
        return
      }

      if (event === 'total_test_end') {
        const snapshot = { ...specsRef.current }
        onStatusRef.current('complete', snapshot)
        onCompleteRef.current(snapshot)
      }
    })
  }, [dispatchRunAll])

  useEffect(() => {
    if (checkId === 0) return

    pendingCheckRef.current = true
    onStatusRef.current('starting', {})

    let cancelled = false
    let attempts = 0

    const tryRun = () => {
      if (cancelled) return

      // Só dispara depois do Jest emitir initialize_tests.
      if (!jestReadyRef.current || !getClientRef.current()) {
        attempts += 1
        if (attempts < CLIENT_MAX_ATTEMPTS) {
          window.setTimeout(tryRun, CLIENT_POLL_MS)
        }
        return
      }

      if (dispatchRunAll()) {
        pendingCheckRef.current = false
      }
    }

    window.setTimeout(tryRun, 50)

    return () => {
      cancelled = true
    }
  }, [checkId, dispatchRunAll])

  return (
    <iframe
      ref={iframe}
      title="Lab Jest"
      style={{ display: 'none', width: 0, height: 0, border: 0 }}
    />
  )
}

function LabTestsPanel({
  status,
  specs,
}: {
  status: TestStatus
  specs: SpecsMap
}) {
  const { passed, total, failed } = countSpecResults(specs)
  const entries = Object.entries(specs)

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 text-sm text-white/90">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-medium text-white">Tests</span>
        <span className="text-xs uppercase tracking-wide text-white/50">
          {status === 'idle' && 'Pronto'}
          {status === 'starting' && 'Iniciando…'}
          {status === 'running' && 'Rodando…'}
          {status === 'complete' && 'Concluído'}
        </span>
      </div>

      {status === 'running' && total === 0 ? (
        <p className="text-white/50">Executando testes…</p>
      ) : null}

      {entries.map(([path, spec]) => (
        <div key={path} className="space-y-1">
          <p className="font-mono text-xs text-white/60">{path}</p>
          {spec.error ? (
            <p className="text-red-300">
              {typeof spec.error === 'string'
                ? spec.error
                : spec.error.message ?? String(spec.error)}
            </p>
          ) : null}
          {Object.entries(spec.tests ?? {}).map(([name, test]) => (
            <div key={name} className="flex items-start gap-2">
              <span
                className={
                  test.status === 'pass'
                    ? 'text-emerald-400'
                    : test.status === 'fail'
                      ? 'text-red-400'
                      : 'text-white/40'
                }
              >
                {test.status === 'pass' ? '✓' : test.status === 'fail' ? '✗' : '·'}
              </span>
              <span className="text-white/80">{name}</span>
            </div>
          ))}
        </div>
      ))}

      {status === 'complete' && total > 0 ? (
        <p className="mt-auto border-t border-white/10 pt-2 text-xs text-white/60">
          {failed > 0
            ? `${failed} falhou, ${passed} passou · ${total} total`
            : `${passed} passou · ${total} total`}
        </p>
      ) : null}
    </div>
  )
}

function LabPlaygroundInner({
  stepId,
  onStepCheckPass,
  hasTests,
}: {
  stepId: string
  onStepCheckPass: (stepId: string) => void
  hasTests: boolean
}) {
  const { sandpack } = useSandpack()
  const sandpackRef = useRef(sandpack)
  sandpackRef.current = sandpack

  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [checkId, setCheckId] = useState(0)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [liveSpecs, setLiveSpecs] = useState<SpecsMap>({})
  /** null = só editor; usuário abre Result/Console/Testes pelos botões */
  const [rightTab, setRightTab] = useState<
    'preview' | 'console' | 'tests' | null
  >(null)
  /** Pasta fechada por padrão; fechar NÃO reseta activeFile. */
  const [filesOpen, setFilesOpen] = useState(false)
  const passCalledRef = useRef(false)
  const checkingRef = useRef(false)
  const stepIdRef = useRef(stepId)
  const onPassRef = useRef(onStepCheckPass)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryUsedRef = useRef(false)
  const preCheckFilesRef = useRef<Record<string, string> | null>(null)

  stepIdRef.current = stepId
  onPassRef.current = onStepCheckPass

  const clearCheckTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const restoreStudentFiles = useCallback(() => {
    const backup = preCheckFilesRef.current
    if (!backup) return
    for (const [path, code] of Object.entries(backup)) {
      try {
        sandpackRef.current.updateFile(path, code)
      } catch {
        // ignore
      }
    }
    preCheckFilesRef.current = null
  }, [])

  const prepareStudentFilesForCheck = useCallback(() => {
    const backup: Record<string, string> = {}
    for (const path of STUDENT_CODE_PATHS) {
      const file = sandpackRef.current.files[path]
      if (!file?.code) continue
      backup[path] = file.code
      const next = withLabAutoExports(file.code)
      if (next !== file.code) {
        try {
          sandpackRef.current.updateFile(path, next)
        } catch {
          // ignore
        }
      }
    }
    preCheckFilesRef.current = backup
  }, [])

  useEffect(() => {
    passCalledRef.current = false
    retryUsedRef.current = false
    setCheckError(null)
    setChecking(false)
    checkingRef.current = false
    setTestStatus('idle')
    setLiveSpecs({})
    restoreStudentFiles()
    clearCheckTimeout()
  }, [stepId, clearCheckTimeout, restoreStudentFiles])

  useEffect(
    () => () => {
      clearCheckTimeout()
      restoreStudentFiles()
    },
    [clearCheckTimeout, restoreStudentFiles],
  )

  const scheduleCheckTimeout = useCallback(() => {
    clearCheckTimeout()
    timeoutRef.current = setTimeout(() => {
      if (!checkingRef.current) return
      checkingRef.current = false
      restoreStudentFiles()
      setChecking(false)
      setCheckError(
        'Tempo esgotado. Espere o editor carregar e clique em Verificar de novo.',
      )
    }, CHECK_TIMEOUT_MS)
  }, [clearCheckTimeout, restoreStudentFiles])

  const startCheckRun = useCallback(
    (opts?: { isRetry?: boolean }) => {
      setRightTab('tests')
      setCheckError(null)
      setChecking(true)
      checkingRef.current = true
      passCalledRef.current = false
      if (!opts?.isRetry) retryUsedRef.current = false
      prepareStudentFilesForCheck()
      scheduleCheckTimeout()
      // Pequeno delay para o bundler pegar o export injetado
      window.setTimeout(() => {
        if (!checkingRef.current) return
        setCheckId((id) => id + 1)
      }, 200)
    },
    [prepareStudentFilesForCheck, scheduleCheckTimeout],
  )

  const finishCheck = useCallback(
    (specs: SpecsMap) => {
      if (!checkingRef.current) return

      const fileError = getSpecFileError(specs)
      const transpilePending =
        !!fileError && /hasn['’]t been transpiled yet/i.test(fileError)

      if (transpilePending && !retryUsedRef.current) {
        retryUsedRef.current = true
        window.setTimeout(() => {
          if (!checkingRef.current) return
          setCheckId((id) => id + 1)
        }, 1200)
        return
      }

      clearCheckTimeout()
      checkingRef.current = false
      restoreStudentFiles()

      const { passed, total, failed } = countSpecResults(specs)
      const passedAll = total > 0 && failed === 0 && passed === total

      queueMicrotask(() => {
        setChecking(false)
        if (passedAll) {
          if (!passCalledRef.current) {
            passCalledRef.current = true
            onPassRef.current(stepIdRef.current)
          }
          setCheckError(null)
          return
        }

        if (fileError) {
          setCheckError(
            transpilePending
              ? 'O código ainda estava compilando. Clique em Verificar de novo.'
              : `Erro nos testes: ${fileError}`,
          )
          return
        }

        setCheckError(
          total === 0
            ? 'Nenhum teste encontrado. Confira o arquivo *.test.js do step.'
            : `Neste passo: ${passed} de ${total} testes passaram. Corrija e tente de novo.`,
        )
      })
    },
    [clearCheckTimeout, restoreStudentFiles],
  )

  const handleTestsComplete = useCallback(
    (specs: SpecsMap) => {
      if (!checkingRef.current) return
      finishCheck(specs)
    },
    [finishCheck],
  )

  const handleStatusChange = useCallback(
    (status: TestStatus, specs: SpecsMap) => {
      setTestStatus(status)
      setLiveSpecs(specs)
    },
    [],
  )

  const toggleRightTab = useCallback(
    (tab: 'preview' | 'console' | 'tests') => {
      setRightTab((current) => (current === tab ? null : tab))
    },
    [],
  )

  const handleCheckWork = useCallback(() => {
    if (!hasTests) {
      if (!passCalledRef.current) {
        passCalledRef.current = true
        onPassRef.current(stepIdRef.current)
      }
      return
    }
    startCheckRun()
  }, [hasTests, startCheckRun])

  const sideTabs = (
    [
      ['preview', 'Result'],
      ['console', 'Console'],
      ...(hasTests ? ([['tests', 'Testes']] as const) : []),
    ] as const
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {hasTests ? (
        <LabJestRunner
          checkId={checkId}
          onComplete={handleTestsComplete}
          onStatusChange={handleStatusChange}
        />
      ) : null}

      <div className="flex items-center gap-1 border-b border-[#25252A] bg-[#2a2d31] px-2 py-1.5">
        <button
          type="button"
          onClick={() => setFilesOpen((open) => !open)}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${filesOpen
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          aria-pressed={filesOpen}
          aria-label={filesOpen ? 'Fechar arquivos' : 'Abrir arquivos'}
          title={filesOpen ? 'Fechar arquivos' : 'Arquivos'}
        >
          {filesOpen ? (
            <FolderOpen className="h-4 w-4" weight="duotone" />
          ) : (
            <Folder className="h-4 w-4" weight="duotone" />
          )}
          <span>Arquivos</span>
        </button>
      </div>

      <SandpackLayout>
        {filesOpen ? (
          <SandpackFileExplorer
            autoHiddenFiles
            style={{
              width: 200,
              minWidth: 160,
              height: '100%',
              borderRight: '1px solid #25252A',
            }}
          />
        ) : null}
        <SandpackCodeEditor
          style={{ height: '100%', flex: 1 }}
          showLineNumbers
          showTabs={filesOpen}
        />
        {rightTab ? (
          <div className="flex min-h-0 flex-1 flex-col border-l border-[#25252A]">
            <div className="relative min-h-0 flex-1 bg-[#1A1A1A]">
              {rightTab === 'preview' ? (
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton={false}
                />
              ) : null}
              {rightTab === 'console' ? (
                <SandpackConsole showHeader={false} />
              ) : null}
              {hasTests && rightTab === 'tests' ? (
                <LabTestsPanel status={testStatus} specs={liveSpecs} />
              ) : null}
            </div>
          </div>
        ) : null}
      </SandpackLayout>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#25252A] bg-[#373A3E] px-3 py-2">
        <button
          type="button"
          onClick={handleCheckWork}
          disabled={checking}
          className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#86efac] px-3 h-[42px] py-1.5 text-sm font-semibold text-black hover:bg-[#6ee7a0] disabled:opacity-60"
        >
          {checking ? (
            <Loader2
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : null}
          Verificar
        </button>
        <div className="mx-1 h-6 w-px bg-white/15" />
        {sideTabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleRightTab(id)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide ${rightTab === id
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
          >
            {label}
          </button>
        ))}
        {checkError ? (
          <p className="text-xs text-red-300">{checkError}</p>
        ) : null}
      </div>
    </div>
  )
}

export type LabPlaygroundProps = {
  lessonId: number
  files?: Record<string, string>
  template?: 'vanilla' | 'react'
  activeTests: { testFile?: string; tests?: Record<string, string> }
  stepId: string
  onStepCheckPass: (stepId: string) => void
  className?: string
  height?: number | string
}

const REACT_BOOTSTRAP: Record<string, string> = {
  '/App.js': `export default function App() {
  return <div>Lab</div>;
}`,
  '/public/index.html': `<!DOCTYPE html>
<html>
<head><title>Lab</title></head>
<body><div id="root"></div></body>
</html>`,
  '/index.js': `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
const root = createRoot(document.getElementById("root"));
root.render(<StrictMode><App /></StrictMode>);`,
}

function buildInitialFiles(
  template: 'vanilla' | 'react',
  files: Record<string, string> | undefined,
  testFiles: Record<string, string>,
): Record<string, string> {
  const helpers: Record<string, string> = {
    [LAB_TEST_HELPERS_PATH]: buildLabTestHelpersSource(),
  }

  if (template === 'react') {
    const studentIndex = files?.['/index.js']
    const merged = { ...REACT_BOOTSTRAP, ...(files ?? {}) }
    if (studentIndex && !files?.['/App.js']) {
      merged['/App.js'] = studentIndex
    }
    merged['/index.js'] = REACT_BOOTSTRAP['/index.js']
    return { ...merged, ...testFiles, ...helpers }
  }

  return {
    ...(files ?? { '/index.js': '// escreva seu código aqui\n' }),
    ...testFiles,
    ...helpers,
  }
}

export function LabPlayground({
  lessonId,
  files,
  template = 'vanilla',
  activeTests,
  stepId,
  onStepCheckPass,
  className = '',
  height = '100%',
}: LabPlaygroundProps) {
  const testFiles = useMemo(() => resolveTestFiles(activeTests), [activeTests])
  const hasTests = Object.keys(testFiles).length > 0
  const effectiveTemplate: 'vanilla' | 'react' =
    hasTests || template === 'react' ? 'react' : 'vanilla'

  const initialFilesRef = useRef<Record<string, string> | null>(null)
  if (initialFilesRef.current === null) {
    initialFilesRef.current = buildInitialFiles(
      effectiveTemplate,
      files,
      testFiles,
    )
  }

  const initialPlainFiles = initialFilesRef.current!

  const { entryFile, visibleFiles } = useMemo(
    () =>
      getStudentVisibleFiles(
        effectiveTemplate,
        files,
        Object.keys(initialPlainFiles),
      ),
    [effectiveTemplate, files, initialPlainFiles, lessonId],
  )

  const providerFiles = useMemo(
    () => applyHiddenFlags(initialPlainFiles, visibleFiles),
    [initialPlainFiles, visibleFiles],
  )

  const heightValue = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`flex min-h-0 w-full flex-col overflow-hidden rounded-lg border border-[#25252A] bg-[#1A1A1A] ${className}`}
      style={{ height: heightValue, minHeight: 360 }}
    >
      {/*
        Plano C (dois SandpackProviders ativo↔standby): ao swapear, preservar
        filesOpen, activeFile e visibleFiles filtrada — este explorer vive no
        mesmo provider e é ortogonal à SyncStepTests.
      */}
      <SandpackProvider
        key={lessonId}
        template={effectiveTemplate}
        theme="dark"
        files={providerFiles}
        options={{
          autorun: true,
          recompileMode: 'delayed',
          activeFile: entryFile,
          visibleFiles,
          classes: {
            'sp-wrapper': '!h-full !min-h-0 !rounded-none !border-0 !bg-transparent',
            'sp-layout': '!h-full !min-h-0 !flex !flex-row !border-0 !bg-[#1A1A1A]',
            'sp-stack': '!h-full !w-full !bg-[#1A1A1A] !min-h-0',
            'sp-code-editor': '!bg-[#1A1A1A]',
            'sp-file-explorer': '!bg-[#1A1A1A] !border-0',
          },
        }}
      >
        <SyncStepTests stepId={stepId} testFiles={testFiles} />
        <LabPlaygroundInner
          stepId={stepId}
          onStepCheckPass={onStepCheckPass}
          hasTests={hasTests}
        />
      </SandpackProvider>
    </div>
  )
}
