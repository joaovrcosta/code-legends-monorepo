'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
  useSandpackClient,
  useSandpackConsole,
} from '@codesandbox/sandpack-react'
import { Folder, FolderOpen } from '@phosphor-icons/react'
import { Loader2 } from 'lucide-react'
import {
  LAB_TEST_HELPERS_PATH,
  buildLabTestHelpersSource,
} from '@/lib/lab/lab-test-helpers-source'
import { withLabAutoExports } from '@/lib/lab/lab-auto-exports'
import {
  isLabSandpackRuntimeGateEnabled,
} from '@/lib/lab/lab-feature-flags'

const DEFAULT_TEST_PATH = '/lab.step.test.js'
const CHECK_TIMEOUT_MS = 30000
const CLIENT_POLL_MS = 200
const CLIENT_MAX_ATTEMPTS = 50
const CHECK_START_DELAY_MS = 350
/** Tempo máx. para a preview reexecutar após o Verificar e enviar console.log. */
const CONSOLE_CAPTURE_GRACE_MS = 2000
const CONSOLE_CAPTURE_AFTER_DONE_MS = 250
/** Ignora cliques repetidos no Verificar (leading-edge). */
const VERIFY_CLICK_DEBOUNCE_MS = 1000
/** Cold start do bundler Sandpack — clear de isWaking no done/success ou neste timeout. */
const WAKING_TIMEOUT_MS = 8000
/** Debounce hot → cold quando Result fechado e idle. */
const RUNTIME_COLD_DEBOUNCE_MS = 400

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

/** Path único por step — evita Jest/Sandpack reusar o testFile do passo anterior. */
function stepTestPath(stepId: string): string {
  const safe = String(stepId).replace(/[^a-zA-Z0-9_-]/g, '_') || 'step'
  return `/lab.step.${safe}.test.js`
}

function isManagedLabStepTestPath(path: string): boolean {
  return (
    path === DEFAULT_TEST_PATH ||
    /^\/lab\.step\.[^/]+\.test\.[tj]sx?$/i.test(path)
  )
}

function resolveTestFiles(
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

function isTestFilePath(path: string): boolean {
  return (
    isManagedLabStepTestPath(path) ||
    path === LAB_TEST_HELPERS_PATH ||
    /\.(test|spec)\.[tj]sx?$/i.test(path)
  )
}

function getEntryFile(template: 'vanilla' | 'react'): string {
  return template === 'react' ? '/App.js' : '/index.js'
}

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

const STUDENT_CODE_PATHS = ['/App.js', '/index.js'] as const

function SyncStepTests({
  stepId,
  testFiles,
}: {
  stepId: string
  testFiles: Record<string, string>
}) {
  // Troca o arquivo de teste do step e remove os dos steps anteriores.
  // run-all-tests do Sandpack executa TODOS os *.test.js — sem delete, o
  // step-1 continua passando junto com o step-2.
  //
  // Importante: NÃO depender de `sandpack` no effect — a identidade muda após
  // updateFile e gerava loop de rebundle (dezenas de postMessage/s idle).
  const { sandpack } = useSandpack()
  const sandpackRef = useRef(sandpack)
  sandpackRef.current = sandpack

  useLayoutEffect(() => {
    const sp = sandpackRef.current
    const keep = new Set(Object.keys(testFiles))

    for (const [path, code] of Object.entries(testFiles)) {
      if (sp.files[path]?.code === code) continue
      try {
        sp.updateFile(path, code)
      } catch {
        // ignore
      }
    }

    for (const path of Object.keys(sp.files)) {
      if (!isManagedLabStepTestPath(path)) continue
      if (keep.has(path)) continue
      const inactive = '/* inactive lab step */\n'
      try {
        // Prefer delete; fallback esvazia o arquivo para o Jest não herdar testes velhos.
        if (typeof sp.deleteFile === 'function') {
          sp.deleteFile(path)
        } else if (sp.files[path]?.code !== inactive) {
          sp.updateFile(path, inactive)
        }
      } catch {
        try {
          if (sp.files[path]?.code !== inactive) {
            sp.updateFile(path, inactive)
          }
        } catch {
          // ignore
        }
      }
    }
  }, [stepId, testFiles])

  return null
}

type SandpackConsoleLog = {
  id: string
  method: string
  data?: Array<string | number | boolean | Record<string, unknown> | null>
}

function formatConsolePart(part: unknown): string {
  if (part == null) return ''
  if (
    typeof part === 'string' ||
    typeof part === 'number' ||
    typeof part === 'boolean'
  ) {
    return String(part)
  }
  try {
    return JSON.stringify(part)
  } catch {
    return String(part)
  }
}

function logFingerprint(log: SandpackConsoleLog): string {
  return `${log.method}:${(log.data ?? []).map(formatConsolePart).join('\u0000')}`
}

/** Remove linhas consecutivas idênticas (Jest + preview costumam duplicar). */
function dedupeConsecutiveLogs(logs: SandpackConsoleLog[]): SandpackConsoleLog[] {
  const out: SandpackConsoleLog[] = []
  let prev = ''
  for (const log of logs) {
    const fp = logFingerprint(log)
    if (fp === prev) continue
    prev = fp
    out.push(log)
  }
  return out
}

/**
 * Se a lista for N execuções iguais (restore + refresh, ou 3×),
 * ou uma execução + cauda parcial da mesma execução, mantém só um ciclo.
 * Não colapsa padrões legítimos curtos (ex.: 1, 2, 1 do aluno).
 */
function collapseDuplicatedRun(logs: SandpackConsoleLog[]): SandpackConsoleLog[] {
  const consecutive = dedupeConsecutiveLogs(logs)
  const n = consecutive.length
  if (n < 2) return consecutive

  const fps = consecutive.map(logFingerprint)

  // Pelo menos 2 ciclos completos iguais (e o resto prefixo do ciclo).
  for (let period = 1; period <= Math.floor(n / 2); period += 1) {
    if (n < period * 2) continue
    const first = fps.slice(0, period).join('\u0001')
    const second = fps.slice(period, period * 2).join('\u0001')
    if (first !== second) continue
    let ok = true
    for (let i = period * 2; i < n; i += 1) {
      if (fps[i] !== fps[i % period]) {
        ok = false
        break
      }
    }
    if (ok) return consecutive.slice(0, period)
  }

  // Uma execução + cauda parcial: [a,b,c, a,b].
  // Exige cauda com ≥2 itens para não colapsar padrões legítimos (1, 2, 1).
  for (let period = n - 1; period >= 2; period -= 1) {
    const restLen = n - period
    if (restLen < 2 || restLen >= period) continue
    const first = fps.slice(0, period)
    const rest = fps.slice(period)
    if (rest.every((fp, i) => fp === first[i])) {
      return consecutive.slice(0, period)
    }
  }

  return consecutive
}

/**
 * Console só exibe saída capturada no "Verificar" (ignora autorun ao digitar).
 * A captura começa no fim do check (após os testes), com um único refresh.
 */
function LabVerifyConsole({
  sessionId,
  capturing,
  onCaptureLogsChange,
}: {
  sessionId: number
  capturing: boolean
  onCaptureLogsChange?: (logs: SandpackConsoleLog[]) => void
}) {
  const { logs, reset } = useSandpackConsole({
    resetOnPreviewRestart: false,
    showSyntaxError: false,
  })
  const [snapshot, setSnapshot] = useState<SandpackConsoleLog[]>([])
  const wasCapturingRef = useRef(false)
  const lateUntilRef = useRef(0)
  const resetRef = useRef(reset)
  const onLogsRef = useRef(onCaptureLogsChange)
  resetRef.current = reset
  onLogsRef.current = onCaptureLogsChange

  useEffect(() => {
    if (sessionId <= 0) {
      wasCapturingRef.current = false
      lateUntilRef.current = 0
      setSnapshot((prev) => (prev.length === 0 ? prev : []))
      return
    }

    // Sempre limpa ao (re)iniciar captura nesta sessão — senão logs de um
    // Verificar anterior vazam (ex.: "12" fantasma no step 2).
    if (capturing) {
      wasCapturingRef.current = true
      lateUntilRef.current = 0
      resetRef.current()
      setSnapshot([])
      onLogsRef.current?.([])
    }
  }, [sessionId, capturing])

  useEffect(() => {
    if (sessionId <= 0) return
    const typed = collapseDuplicatedRun(logs as SandpackConsoleLog[])
    if (capturing) {
      onLogsRef.current?.(typed)
      return
    }
    if (wasCapturingRef.current) {
      wasCapturingRef.current = false
      // Janela curta só para logs atrasados da MESMA execução — não para um 2º run.
      lateUntilRef.current = Date.now() + 400
      setSnapshot(typed)
      onLogsRef.current?.(typed)
      return
    }
    if (Date.now() < lateUntilRef.current && typed.length > 0) {
      // Só atualiza se ainda for o mesmo ciclo (sem dobrar a saída).
      setSnapshot((prev) => {
        if (prev.length === 0) return typed
        if (typed.length <= prev.length) return prev
        const prevFp = prev.map(logFingerprint).join('\u0001')
        const nextFp = typed.map(logFingerprint).join('\u0001')
        if (nextFp.startsWith(prevFp) && nextFp.length > prevFp.length) {
          // Cresceu com prefixo igual — se o extra for repetição do prev, ignora.
          const extra = typed.slice(prev.length)
          const extraFp = extra.map(logFingerprint)
          const baseFp = prev.map(logFingerprint)
          if (extraFp.every((fp, i) => fp === baseFp[i])) return prev
          return typed
        }
        return prev
      })
      onLogsRef.current?.(typed)
    }
  }, [logs, capturing, sessionId])

  const display: SandpackConsoleLog[] =
    sessionId <= 0
      ? []
      : capturing
        ? collapseDuplicatedRun(logs as SandpackConsoleLog[])
        : snapshot

  return (
    <div className="h-full min-h-0 overflow-auto bg-[#1A1A1A] p-2 font-mono text-xs leading-relaxed text-white/90">
      {display.length === 0 ? (
        <p className="text-white/35">
          {sessionId > 0
            ? capturing
              ? 'Capturando saída…'
              : 'Sem saída neste Verificar.'
            : 'Clique em Verificar para ver a saída do console.'}
        </p>
      ) : (
        <div className="space-y-1">
          {display.map((log) => (
            <div
              key={log.id}
              className={
                log.method === 'error'
                  ? 'text-red-300'
                  : log.method === 'warn'
                    ? 'text-amber-300'
                    : 'text-white/85'
              }
            >
              {(log.data ?? []).map((part, index) => (
                <span key={`${log.id}-${index}`}>
                  {formatConsolePart(part)}{' '}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Erros de bundle/sintaxe (overlay Sandpack), além de console.error. */
function LabSandpackBundlerErrorListener({
  sessionId,
  capturing,
  onBundlerError,
}: {
  sessionId: number
  capturing: boolean
  onBundlerError: () => void
}) {
  const { listen } = useSandpackClient()
  const listenRef = useRef(listen)
  const onErrorRef = useRef(onBundlerError)
  const gateRef = useRef(false)
  listenRef.current = listen
  onErrorRef.current = onBundlerError

  useEffect(() => {
    gateRef.current = sessionId > 0 && capturing
  }, [sessionId, capturing])

  useEffect(() => {
    return listenRef.current((msg) => {
      if (!gateRef.current) return
      const data = msg as {
        type?: string
        action?: string
        notificationType?: string
        compilatonError?: boolean
      }
      if (data.type === 'action' && data.action === 'show-error') {
        onErrorRef.current()
        return
      }
      if (
        data.type === 'action' &&
        data.action === 'notification' &&
        data.notificationType === 'error'
      ) {
        onErrorRef.current()
        return
      }
      if (data.type === 'done' && data.compilatonError) {
        onErrorRef.current()
      }
    })
  }, [])

  return null
}

/**
 * Runner Jest no mesmo padrão do SandpackTests (useSandpackClient),
 * mas só dispara run-all-tests quando o client existe — evita o stuck
 * em "running" sem onComplete.
 *
 * getClient/listen do Sandpack mudam de identidade a cada render; usamos
 * refs para não re-disparar effects (isso causava loop + erro de deps).
 *
 * Cada checkId é uma geração: total_test_end antigo é ignorado.
 *
 * Caso de teste (gate on): Verificar antes do bundler inicial terminar —
 * pendingCheckRef permanece true até initialize_tests / client pronto;
 * não fica stuck em "Verificando…" (CHECK_TIMEOUT_MS cobre falha).
 */
function LabJestRunner({
  checkId,
  onComplete,
  onStatusChange,
  invalidateRef,
}: {
  checkId: number
  onComplete: (specs: SpecsMap, checkId: number) => void
  onStatusChange: (status: TestStatus, specs: SpecsMap) => void
  /** Chamar após refresh do console — marca Jest como não pronto. */
  invalidateRef: MutableRefObject<(() => void) | null>
}) {
  const { getClient, iframe, listen } = useSandpackClient()
  const specsRef = useRef<SpecsMap>({})
  const jestReadyRef = useRef(false)
  const pendingCheckRef = useRef(false)
  const activeCheckIdRef = useRef(0)
  /** checkId da run que está em andamento (capturado no total_test_start). */
  const runningCheckIdRef = useRef(0)
  const getClientRef = useRef(getClient)
  const listenRef = useRef(listen)
  const onCompleteRef = useRef(onComplete)
  const onStatusRef = useRef(onStatusChange)

  getClientRef.current = getClient
  listenRef.current = listen
  onCompleteRef.current = onComplete
  onStatusRef.current = onStatusChange

  useEffect(() => {
    invalidateRef.current = () => {
      jestReadyRef.current = false
    }
    return () => {
      invalidateRef.current = null
    }
  }, [invalidateRef])

  const dispatchRunAll = useCallback(() => {
    const client = getClientRef.current()
    if (!client) return false
    specsRef.current = {}
    runningCheckIdRef.current = activeCheckIdRef.current
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
        // Só "Iniciando…" se ainda vamos disparar run-all-tests.
        // Senão um initialize tardio (após complete) deixa o painel preso.
        if (pendingCheckRef.current) {
          onStatusRef.current('starting', specsRef.current)
          pendingCheckRef.current = false
          dispatchRunAll()
        } else if (activeCheckIdRef.current === 0) {
          onStatusRef.current('idle', specsRef.current)
        }
        return
      }

      const activeId = activeCheckIdRef.current
      if (activeId === 0) return

      if (event === 'total_test_start') {
        specsRef.current = {}
        runningCheckIdRef.current = activeId
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
        const completedId = runningCheckIdRef.current
        // Sem run marcada, ou run antiga depois de um novo Verificar.
        if (!completedId || completedId !== activeId) return
        runningCheckIdRef.current = 0
        // Libera o status: initialize_tests tardio não deve voltar a "Iniciando…".
        if (activeCheckIdRef.current === completedId) {
          activeCheckIdRef.current = 0
        }
        const snapshot = { ...specsRef.current }
        onStatusRef.current('complete', snapshot)
        onCompleteRef.current(snapshot, completedId)
      }
    })
  }, [dispatchRunAll])

  useEffect(() => {
    if (checkId === 0) return

    activeCheckIdRef.current = checkId
    pendingCheckRef.current = true
    runningCheckIdRef.current = 0
    specsRef.current = {}
    onStatusRef.current('starting', {})

    let cancelled = false
    let attempts = 0

    const tryRun = () => {
      if (cancelled || activeCheckIdRef.current !== checkId) return

      const client = getClientRef.current()
      // Pronto: dispara agora. Senão, continua pending — initialize_tests
      // (após rebundle) chama dispatchRunAll.
      if (jestReadyRef.current && client && dispatchRunAll()) {
        pendingCheckRef.current = false
        return
      }

      attempts += 1
      if (attempts < CLIENT_MAX_ATTEMPTS) {
        window.setTimeout(tryRun, CLIENT_POLL_MS)
      }
      // Esgotou o poll: NÃO falha aqui. Mantém pendingCheckRef=true para
      // initialize_tests atrasado (comum ao trocar de step / injetar exports).
    }

    window.setTimeout(tryRun, 50)

    return () => {
      cancelled = true
      // Invalida fim de run desta geração se um checkId novo começar.
      if (activeCheckIdRef.current === checkId) {
        runningCheckIdRef.current = 0
      }
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
  onStepCheckFail,
  hasTests,
  expected,
  testFiles,
  runtimeGateEnabled,
  runtimeHot,
  setRuntimeHot,
  setWantsRuntimeHot,
}: {
  stepId: string
  onStepCheckPass: (stepId: string) => void
  onStepCheckFail?: (stepId: string) => void
  hasTests: boolean
  /** Pergunta amigável do step; mostrada no rodapé se o Verificar falhar. */
  expected?: string
  testFiles: Record<string, string>
  runtimeGateEnabled: boolean
  runtimeHot: boolean
  setRuntimeHot: (hot: boolean) => void
  setWantsRuntimeHot: (hot: boolean) => void
}) {
  const { sandpack, dispatch: sandpackDispatch, listen } = useSandpack()
  const sandpackRef = useRef(sandpack)
  sandpackRef.current = sandpack
  const dispatchRef = useRef(sandpackDispatch)
  dispatchRef.current = sandpackDispatch
  const listenRef = useRef(listen)
  listenRef.current = listen
  const invalidateJestRef = useRef<(() => void) | null>(null)
  const runtimeHotRef = useRef(runtimeHot)
  runtimeHotRef.current = runtimeHot
  const isWakingRef = useRef(false)
  const wakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wakingUnsubRef = useRef<(() => void) | null>(null)

  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  /** true após um Verificar que não passou (para exibir `expected`). */
  const [showExpected, setShowExpected] = useState(false)
  const [checkId, setCheckId] = useState(0)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [liveSpecs, setLiveSpecs] = useState<SpecsMap>({})
  /** null = só editor; usuário abre Result/Console/Testes pelos botões */
  const [rightTab, setRightTab] = useState<
    'preview' | 'console' | 'tests' | null
  >(null)
  /** Pasta fechada por padrão; fechar NÃO reseta activeFile. */
  const [filesOpen, setFilesOpen] = useState(false)
  /** Sessão do console: só captura logs durante Verificar. */
  const [consoleSessionId, setConsoleSessionId] = useState(0)
  const [consoleCapturing, setConsoleCapturing] = useState(false)
  const passCalledRef = useRef(false)
  const checkingRef = useRef(false)
  /** Timestamp do último clique em Verificar (debounce de spam). */
  const lastVerifyClickRef = useRef(0)
  const stepIdRef = useRef(stepId)
  const onPassRef = useRef(onStepCheckPass)
  const onFailRef = useRef(onStepCheckFail)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const consoleFreezeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Timeout de 200ms que inicia captura pós-Verificar (precisa cancelar em clique rápido). */
  const consoleCaptureStartRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Delay de 40ms do refresh pós-captura. */
  const consoleRefreshDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Unsubscribe do listen de endChecking — órfão causa refresh que aborta o Jest. */
  const endCheckingUnsubRef = useRef<(() => void) | null>(null)
  /** Geração do settle atual; invalida callbacks atrasados. */
  const endCheckingGenRef = useRef(0)
  const expectedCheckIdRef = useRef(0)
  const transpileRetryCountRef = useRef(0)
  const preCheckFilesRef = useRef<Record<string, string> | null>(null)
  const verifyConsoleLogsRef = useRef<SandpackConsoleLog[]>([])
  const bundlerErrorRef = useRef(false)

  stepIdRef.current = stepId
  onPassRef.current = onStepCheckPass
  onFailRef.current = onStepCheckFail

  const testFilesRef = useRef(testFiles)
  testFilesRef.current = testFiles

  const notifyFail = useCallback(() => {
    onFailRef.current?.(stepIdRef.current)
  }, [])

  const handleCaptureLogsChange = useCallback((logs: SandpackConsoleLog[]) => {
    verifyConsoleLogsRef.current = logs
  }, [])

  const handleBundlerError = useCallback(() => {
    bundlerErrorRef.current = true
  }, [])

  const clearCheckTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const clearStartDelay = useCallback(() => {
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current)
      startDelayRef.current = null
    }
  }, [])

  /**
   * Cancela timers/listen do pós-Verificar. Crítico: se o aluno clicar de novo
   * antes do settle, um refresh atrasado aborta o Jest e trava em "Verificando…".
   */
  const clearConsoleFreeze = useCallback(() => {
    endCheckingGenRef.current += 1
    if (consoleFreezeRef.current) {
      clearTimeout(consoleFreezeRef.current)
      consoleFreezeRef.current = null
    }
    if (consoleCaptureStartRef.current) {
      clearTimeout(consoleCaptureStartRef.current)
      consoleCaptureStartRef.current = null
    }
    if (consoleRefreshDelayRef.current) {
      clearTimeout(consoleRefreshDelayRef.current)
      consoleRefreshDelayRef.current = null
    }
    if (endCheckingUnsubRef.current) {
      endCheckingUnsubRef.current()
      endCheckingUnsubRef.current = null
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

  /**
   * Garante que só o testFile do step atual exista antes do Jest.
   * O stamp lab-check força re-transpile: specs com `const code = readStudentCode()`
   * no topo do módulo senão ficam com o código do aluno da 1ª avaliação (cache Jest).
   */
  const syncActiveTestFiles = useCallback(() => {
    const keep = new Set(Object.keys(testFiles))
    const stamp = `/* lab-check:${Date.now()} */\n`
    for (const [path, code] of Object.entries(testFiles)) {
      try {
        sandpackRef.current.updateFile(path, stamp + code)
      } catch {
        // ignore
      }
    }
    for (const path of Object.keys(sandpackRef.current.files)) {
      if (!isManagedLabStepTestPath(path) || keep.has(path)) continue
      try {
        if (typeof sandpackRef.current.deleteFile === 'function') {
          sandpackRef.current.deleteFile(path)
        } else {
          sandpackRef.current.updateFile(path, '/* inactive lab step */\n')
        }
      } catch {
        try {
          sandpackRef.current.updateFile(path, '/* inactive lab step */\n')
        } catch {
          // ignore
        }
      }
    }
  }, [testFiles])

  const refreshPreview = useCallback(() => {
    try {
      dispatchRef.current({ type: 'refresh' })
    } catch {
      // ignore
    }
  }, [])

  const clearWaking = useCallback(() => {
    isWakingRef.current = false
    if (wakingTimeoutRef.current) {
      clearTimeout(wakingTimeoutRef.current)
      wakingTimeoutRef.current = null
    }
    if (wakingUnsubRef.current) {
      wakingUnsubRef.current()
      wakingUnsubRef.current = null
    }
  }, [])

  /**
   * Acorda o bundler sob o gate (autorun:false).
   * Path com testes: run sem refresh (refresh aborta o Jest).
   * Path sem testes: refresh único.
   * Cliques rápidos: se já está acordando, ainda enfileira a ação pedida
   * (senão o Verificar sobe checking sem runSandpack e trava).
   */
  const wakeRuntime = useCallback(
    (mode: 'run' | 'refresh') => {
      setRuntimeHot(true)
      setWantsRuntimeHot(true)

      if (!runtimeGateEnabled) {
        if (mode === 'refresh') refreshPreview()
        return
      }

      const dispatchWakeAction = () => {
        if (mode === 'refresh') {
          refreshPreview()
          return
        }
        try {
          const run = sandpackRef.current.runSandpack
          if (typeof run === 'function') {
            run.call(sandpackRef.current)
          }
        } catch {
          // ignore — pendingCheck do Jest espera initialize_tests
        }
      }

      if (isWakingRef.current) {
        window.setTimeout(dispatchWakeAction, 0)
        return
      }
      isWakingRef.current = true

      wakingUnsubRef.current = listenRef.current((msg) => {
        const data = msg as { type?: string }
        if (data.type === 'done' || data.type === 'success') {
          clearWaking()
        }
      })
      wakingTimeoutRef.current = setTimeout(clearWaking, WAKING_TIMEOUT_MS)

      // Espera o commit de autoReload:true antes de run/refresh.
      window.setTimeout(dispatchWakeAction, 0)
    },
    [
      runtimeGateEnabled,
      setRuntimeHot,
      setWantsRuntimeHot,
      refreshPreview,
      clearWaking,
    ],
  )

  useEffect(() => {
    const wantsHot =
      !runtimeGateEnabled ||
      rightTab === 'preview' ||
      checking ||
      consoleCapturing
    setWantsRuntimeHot(wantsHot)
  }, [
    runtimeGateEnabled,
    rightTab,
    checking,
    consoleCapturing,
    setWantsRuntimeHot,
  ])

  useEffect(
    () => () => {
      clearWaking()
    },
    [clearWaking],
  )

  const endChecking = useCallback(
    (options?: {
      onSettled?: () => void
      /**
       * Pass: segura o botão até a captura (e só então chama onSettled/onPass).
       * Fail: libera na hora — senão "Verificando…" fica ~2s a mais à toa.
       */
      holdUntilSettled?: boolean
    }) => {
    clearCheckTimeout()
    clearStartDelay()
    // Novo Verificar chama clearConsoleFreeze e aborta refresh órfão (evita stuck).
    clearConsoleFreeze()
    const gen = endCheckingGenRef.current
    const holdUntilSettled = Boolean(options?.holdUntilSettled)

    if (!holdUntilSettled) {
      checkingRef.current = false
      setChecking(false)
    }

    // Restore primeiro (pode rebundle). Depois espera esfriar, zera o console
    // e dá UM refresh — evita juntar saída do restore com a do refresh.
    restoreStudentFiles()
    setRightTab('console')
    // Limpa saída antiga na hora (senão o aluno vê logs do Verificar anterior
    // enquanto a captura nova ainda não começou).
    setConsoleSessionId((id) => id + 1)
    setConsoleCapturing(true)

    let settled = false
    let refreshDispatched = false
    const settle = () => {
      if (settled || endCheckingGenRef.current !== gen) return
      settled = true
      if (consoleFreezeRef.current) {
        clearTimeout(consoleFreezeRef.current)
        consoleFreezeRef.current = null
      }
      if (consoleCaptureStartRef.current) {
        clearTimeout(consoleCaptureStartRef.current)
        consoleCaptureStartRef.current = null
      }
      if (consoleRefreshDelayRef.current) {
        clearTimeout(consoleRefreshDelayRef.current)
        consoleRefreshDelayRef.current = null
      }
      if (endCheckingUnsubRef.current) {
        endCheckingUnsubRef.current()
        endCheckingUnsubRef.current = null
      }
      if (holdUntilSettled) {
        checkingRef.current = false
        setChecking(false)
      }
      setConsoleCapturing(false)
      const after = options?.onSettled
      if (after) {
        window.setTimeout(after, 0)
      }
    }

    endCheckingUnsubRef.current = listenRef.current((msg) => {
      if (endCheckingGenRef.current !== gen || settled || !refreshDispatched) {
        return
      }
      const data = msg as { type?: string }
      if (data.type !== 'done' && data.type !== 'success') return
      consoleFreezeRef.current = setTimeout(
        settle,
        CONSOLE_CAPTURE_AFTER_DONE_MS,
      )
    })

    // Delay: deixa o rebundle do restore terminar; reset de novo + 1 refresh.
    consoleCaptureStartRef.current = setTimeout(() => {
      consoleCaptureStartRef.current = null
      if (settled || endCheckingGenRef.current !== gen) return
      // Novo bump força reset do LabVerifyConsole após logs do restore.
      setConsoleSessionId((id) => id + 1)
      setConsoleCapturing(true)
      consoleRefreshDelayRef.current = setTimeout(() => {
        consoleRefreshDelayRef.current = null
        if (settled || endCheckingGenRef.current !== gen) return
        refreshDispatched = true
        refreshPreview()
        // Refresh pode matar o client Jest — próximo Verificar espera initialize.
        invalidateJestRef.current?.()
      }, 50)
    }, 350)

    consoleFreezeRef.current = setTimeout(settle, CONSOLE_CAPTURE_GRACE_MS)
  }, [
    clearCheckTimeout,
    clearStartDelay,
    clearConsoleFreeze,
    restoreStudentFiles,
    refreshPreview,
  ])

  useEffect(() => {
    passCalledRef.current = false
    transpileRetryCountRef.current = 0
    expectedCheckIdRef.current = 0
    lastVerifyClickRef.current = 0
    setCheckError(null)
    setChecking(false)
    checkingRef.current = false
    setTestStatus('idle')
    setLiveSpecs({})
    setShowExpected(false)
    verifyConsoleLogsRef.current = []
    bundlerErrorRef.current = false
    clearConsoleFreeze()
    restoreStudentFiles()
    clearCheckTimeout()
    clearStartDelay()
  }, [
    stepId,
    clearCheckTimeout,
    clearStartDelay,
    clearConsoleFreeze,
    restoreStudentFiles,
  ])

  useEffect(
    () => () => {
      clearCheckTimeout()
      clearStartDelay()
      clearConsoleFreeze()
      restoreStudentFiles()
    },
    [clearCheckTimeout, clearStartDelay, clearConsoleFreeze, restoreStudentFiles],
  )

  const scheduleCheckTimeout = useCallback(() => {
    clearCheckTimeout()
    timeoutRef.current = setTimeout(() => {
      if (!checkingRef.current) return
      endChecking()
      setCheckError(
        'Tempo esgotado. Espere o editor carregar e clique em Verificar de novo.',
      )
      notifyFail()
    }, CHECK_TIMEOUT_MS)
  }, [clearCheckTimeout, endChecking, notifyFail])

  const bumpCheckId = useCallback(() => {
    setCheckId((id) => {
      const next = id + 1
      expectedCheckIdRef.current = next
      return next
    })
  }, [])

  const startCheckRun = useCallback(() => {
    // Evita double-click: o disabled do botão só aplica no próximo render.
    if (checkingRef.current) return
    checkingRef.current = true

    // Cancela settle/refresh órfão de um Verificar anterior (trava o Jest).
    clearConsoleFreeze()
    setRightTab('console')
    setCheckError(null)
    setShowExpected(false)
    setChecking(true)
    passCalledRef.current = false
    transpileRetryCountRef.current = 0
    verifyConsoleLogsRef.current = []
    bundlerErrorRef.current = false
    // Console só captura depois dos testes (em endChecking).
    setConsoleCapturing(false)
    scheduleCheckTimeout()

    clearStartDelay()
    // Injeta exports e dispara Jest. Sem refresh: refresh aborta o client e
    // deixa "Verificando…" preso com o painel em Pronto.
    startDelayRef.current = setTimeout(() => {
      startDelayRef.current = null
      if (!checkingRef.current) return
      syncActiveTestFiles()
      prepareStudentFilesForCheck()
      bumpCheckId()
    }, CHECK_START_DELAY_MS)
  }, [
    prepareStudentFilesForCheck,
    syncActiveTestFiles,
    scheduleCheckTimeout,
    clearStartDelay,
    clearConsoleFreeze,
    bumpCheckId,
  ])

  const finishCheck = useCallback(
    (specs: SpecsMap, completedCheckId: number) => {
      if (!checkingRef.current) return
      // Ignora resultado de uma run antiga (clique duplo / retry sobreposto).
      if (completedCheckId !== expectedCheckIdRef.current) return

      const activePaths = new Set(
        Object.keys(testFilesRef.current).map((p) =>
          p.startsWith('/') ? p : `/${p}`,
        ),
      )
      // Só conta specs do step atual (run-all-tests pode ainda ver arquivo antigo).
      const relevantSpecs =
        activePaths.size === 0
          ? specs
          : Object.fromEntries(
              Object.entries(specs).filter(([path]) => {
                const normalized = path.startsWith('/') ? path : `/${path}`
                return activePaths.has(normalized)
              }),
            )

      const { passed, total, failed } = countSpecResults(relevantSpecs)
      const passedAll = total > 0 && failed === 0 && passed === total
      const hasExpected = Boolean(expected?.trim())
      const passedStepId = stepIdRef.current
      const fileError = getSpecFileError(relevantSpecs)
      const transpilePending =
        !!fileError && /hasn['’]t been transpiled yet/i.test(fileError)

      if (transpilePending && transpileRetryCountRef.current < 2) {
        transpileRetryCountRef.current += 1
        const delayMs =
          transpileRetryCountRef.current === 1 ? 1200 : 2000
        scheduleCheckTimeout()
        clearStartDelay()
        startDelayRef.current = setTimeout(() => {
          startDelayRef.current = null
          if (!checkingRef.current) return
          syncActiveTestFiles()
          bumpCheckId()
        }, delayMs)
        return
      }

      // Pass: captura o console antes de avançar o step (senão clearConsoleFreeze
      // no effect do stepId cancela a captura e o console fica vazio).
      // Fail: endChecking libera o botão na hora (sem esperar ~2s de captura).
      if (passedAll) {
        setCheckError(null)
        setShowExpected(false)
        endChecking({
          holdUntilSettled: true,
          onSettled: () => {
            if (!passCalledRef.current) {
              passCalledRef.current = true
              onPassRef.current(passedStepId)
            }
          },
        })
        return
      }

      endChecking()

      if (fileError) {
        setShowExpected(hasExpected)
        setCheckError(
          transpilePending
            ? 'O código ainda estava compilando. Clique em Verificar de novo.'
            : `Erro nos testes: ${fileError}`,
        )
        notifyFail()
        return
      }

      if (total === 0) {
        setShowExpected(hasExpected)
        setCheckError(
          'Nenhum teste encontrado. Confira o arquivo *.test.js do step.',
        )
        notifyFail()
        return
      }

      setShowExpected(hasExpected)
      setCheckError(hasExpected ? null : 'Resposta incorreta. Tente de novo.')
      notifyFail()
    },
    [
      endChecking,
      scheduleCheckTimeout,
      clearStartDelay,
      bumpCheckId,
      syncActiveTestFiles,
      expected,
      notifyFail,
    ],
  )

  const handleTestsComplete = useCallback(
    (specs: SpecsMap, completedCheckId: number) => {
      finishCheck(specs, completedCheckId)
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
      setRightTab((current) => {
        const next = current === tab ? null : tab
        if (next === 'preview') {
          if (runtimeGateEnabled && !runtimeHotRef.current) {
            // Result frio → hot + refresh sob guarda isWaking
            queueMicrotask(() => wakeRuntime('refresh'))
          } else {
            setRuntimeHot(true)
            setWantsRuntimeHot(true)
          }
        }
        return next
      })
    },
    [runtimeGateEnabled, wakeRuntime, setRuntimeHot, setWantsRuntimeHot],
  )

  const handleCheckWork = useCallback(() => {
    const now = Date.now()
    if (now - lastVerifyClickRef.current < VERIFY_CLICK_DEBOUNCE_MS) return
    if (checkingRef.current || checking) return
    lastVerifyClickRef.current = now

    if (!hasTests) {
      // Sem testes: wake + refresh único (captura console)
      checkingRef.current = true
      setChecking(true)
      wakeRuntime('refresh')
      clearConsoleFreeze()
      verifyConsoleLogsRef.current = []
      bundlerErrorRef.current = false
      setConsoleSessionId((id) => id + 1)
      setConsoleCapturing(true)
      setRightTab('console')
      setCheckError(null)
      setShowExpected(false)
      consoleFreezeRef.current = setTimeout(() => {
        consoleFreezeRef.current = null
        setConsoleCapturing(false)
        checkingRef.current = false
        setChecking(false)
        const consoleFailed = verifyConsoleLogsRef.current.some(
          (log) => log.method === 'error',
        )
        if (consoleFailed || bundlerErrorRef.current) {
          setCheckError('Erro no código — corrija antes de continuar.')
          setShowExpected(Boolean(expected?.trim()))
          notifyFail()
          return
        }
        if (!passCalledRef.current) {
          passCalledRef.current = true
          onPassRef.current(stepIdRef.current)
        }
      }, CONSOLE_CAPTURE_GRACE_MS)
      return
    }
    // Com testes: wake sem refresh no meio do Jest (pendingCheck aguarda bundler)
    wakeRuntime('run')
    startCheckRun()
  }, [
    hasTests,
    checking,
    startCheckRun,
    clearConsoleFreeze,
    expected,
    notifyFail,
    wakeRuntime,
  ])

  const sideTabs = (
    [
      ['preview', 'Result'],
      ['console', 'Console'],
      ...(hasTests ? ([['tests', 'Testes']] as const) : []),
    ] as const
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <LabSandpackBundlerErrorListener
        sessionId={consoleSessionId}
        capturing={consoleCapturing}
        onBundlerError={handleBundlerError}
      />
      {hasTests ? (
        <LabJestRunner
          checkId={checkId}
          onComplete={handleTestsComplete}
          onStatusChange={handleStatusChange}
          invalidateRef={invalidateJestRef}
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
          initMode="immediate"
        />
        {/*
          Preview sempre montada e "visível" (sem visibility:hidden) — senão o
          iframe não executa e console.log some no Verificar. Console/Testes
          cobrem com z-index + fundo.
        */}
        <div
          className={
            rightTab
              ? 'relative flex min-h-0 flex-1 flex-col border-l border-[#25252A]'
              : 'pointer-events-none fixed left-[-9999px] top-0 h-[280px] w-[360px] overflow-hidden opacity-0'
          }
          aria-hidden={rightTab == null ? true : undefined}
        >
          <div className="relative min-h-0 flex-1 bg-[#1A1A1A]">
            <div
              className={
                rightTab === 'preview' || rightTab == null
                  ? 'absolute inset-0'
                  : 'pointer-events-none absolute inset-0 opacity-0'
              }
              aria-hidden={rightTab !== 'preview' && rightTab != null}
            >
              <SandpackPreview
                showNavigator={false}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                showSandpackErrorOverlay={false}
              />
            </div>
            <div
              className={
                rightTab === 'console'
                  ? 'absolute inset-0 z-[1] bg-[#1A1A1A]'
                  : 'hidden'
              }
            >
              <LabVerifyConsole
                sessionId={consoleSessionId}
                capturing={consoleCapturing}
                onCaptureLogsChange={handleCaptureLogsChange}
              />
            </div>
            {hasTests ? (
              <div
                className={
                  rightTab === 'tests'
                    ? 'absolute inset-0 z-[1] bg-[#1A1A1A]'
                    : 'hidden'
                }
              >
                <LabTestsPanel status={testStatus} specs={liveSpecs} />
              </div>
            ) : null}
          </div>
        </div>
      </SandpackLayout>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#25252A] bg-[#373A3E] px-3 py-2">
        <button
          type="button"
          onClick={handleCheckWork}
          disabled={checking}
          aria-busy={checking}
          className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#86efac] px-3 h-[42px] py-1.5 text-sm font-semibold text-black hover:bg-[#6ee7a0] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60"
        >
          {checking ? (
            <Loader2
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : null}
          {checking ? 'Verificando…' : 'Verificar'}
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
        {showExpected && expected?.trim() ? (
          <p className="min-w-0 flex-1 text-xs leading-snug text-amber-200/90">
            {expected.trim()}
          </p>
        ) : checkError ? (
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
  /** Pergunta amigável do step ativo; exibida se o Verificar falhar. */
  expected?: string
  onStepCheckPass: (stepId: string) => void
  /** Chamado quando o Verificar falha no step ativo. */
  onStepCheckFail?: (stepId: string) => void
  className?: string
  height?: number | string
}

/** Invalida cache do SandpackProvider quando o bootstrap React muda. */
const LAB_REACT_BOOTSTRAP_VERSION = 'rb3'

const REACT_BOOTSTRAP: Record<string, string> = {
  '/App.js': `export default function App() {
  return <div>Lab</div>;
}`,
  '/public/index.html': `<!DOCTYPE html>
<html>
<head><title>Lab</title></head>
<body><div id="root"></div></body>
</html>`,
  '/index.js': `import { createRoot } from "react-dom/client";
import * as AppModule from "./App";

function EmptyLab() {
  return null;
}

const root = createRoot(document.getElementById("root"));
const App =
  typeof AppModule.default === "function" ? AppModule.default : EmptyLab;
root.render(<App />);
`,
}

function buildInitialFiles(
  template: 'vanilla' | 'react',
  files: Record<string, string> | undefined,
  testFiles: Record<string, string>,
): Record<string, string> {
  const helpers: Record<string, string> = {
    [LAB_TEST_HELPERS_PATH]: buildLabTestHelpersSource(template),
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
  expected,
  onStepCheckPass,
  onStepCheckFail,
  className = '',
  height = '100%',
}: LabPlaygroundProps) {
  const runtimeGateEnabled = isLabSandpackRuntimeGateEnabled()
  const [runtimeHot, setRuntimeHot] = useState(() => !runtimeGateEnabled)
  const [wantsRuntimeHot, setWantsRuntimeHot] = useState(
    () => !runtimeGateEnabled,
  )
  const coldDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!runtimeGateEnabled) {
      setRuntimeHot(true)
      return
    }
    if (wantsRuntimeHot) {
      if (coldDebounceRef.current) {
        clearTimeout(coldDebounceRef.current)
        coldDebounceRef.current = null
      }
      setRuntimeHot(true)
      return
    }
    coldDebounceRef.current = setTimeout(() => {
      coldDebounceRef.current = null
      setRuntimeHot(false)
    }, RUNTIME_COLD_DEBOUNCE_MS)
    return () => {
      if (coldDebounceRef.current) {
        clearTimeout(coldDebounceRef.current)
        coldDebounceRef.current = null
      }
    }
  }, [wantsRuntimeHot, runtimeGateEnabled])

  const testFiles = useMemo(
    () => resolveTestFiles(activeTests, stepId),
    [activeTests, stepId],
  )
  const hasTests = Object.keys(testFiles).length > 0
  // Jest do Sandpack é confiável no template react. Com testes, sempre
  // forçamos react (código do aluno em /App.js; readStudentCode faz fallback
  // se o teste ainda pedir /index.js).
  const effectiveTemplate: 'vanilla' | 'react' =
    hasTests || template === 'react' ? 'react' : 'vanilla'

  const initialFilesRef = useRef<{
    lessonId: number
    version: string
    template: 'vanilla' | 'react'
    files: Record<string, string>
  } | null>(null)

  /*
   * Defesa em profundidade: key={lesson.id} no call-site (lab-view) já remonta e
   * zera este ref; invalidar por lessonId/template é backup se alguém remover o key.
   */
  if (
    initialFilesRef.current === null ||
    initialFilesRef.current.lessonId !== lessonId ||
    initialFilesRef.current.version !== LAB_REACT_BOOTSTRAP_VERSION ||
    initialFilesRef.current.template !== effectiveTemplate
  ) {
    initialFilesRef.current = {
      lessonId,
      version: LAB_REACT_BOOTSTRAP_VERSION,
      template: effectiveTemplate,
      files: buildInitialFiles(effectiveTemplate, files, testFiles),
    }
  }

  const initialPlainFiles = initialFilesRef.current.files

  const { entryFile, visibleFiles } = useMemo(
    () =>
      getStudentVisibleFiles(
        effectiveTemplate,
        files,
        Object.keys(initialPlainFiles),
      ),
    // lessonId força recomputo ao trocar de lição (getStudentVisibleFiles não usa lessonId).
    [effectiveTemplate, files, initialPlainFiles, lessonId],
  )

  const providerFiles = useMemo(
    () => applyHiddenFlags(initialPlainFiles, visibleFiles),
    [initialPlainFiles, visibleFiles],
  )

  const sandpackOptions = useMemo(
    () => ({
      autorun: !runtimeGateEnabled,
      ...(runtimeGateEnabled ? { autoReload: runtimeHot } : {}),
      recompileMode: 'delayed' as const,
      recompileDelay: 500,
      activeFile: entryFile,
      visibleFiles,
      classes: {
        'sp-wrapper': '!h-full !min-h-0 !rounded-none !border-0 !bg-transparent',
        'sp-layout': '!h-full !min-h-0 !flex !flex-row !border-0 !bg-[#1A1A1A]',
        'sp-stack': '!h-full !w-full !bg-[#1A1A1A] !min-h-0',
        'sp-code-editor': '!bg-[#1A1A1A]',
        'sp-file-explorer': '!bg-[#1A1A1A] !border-0',
      },
    }),
    [runtimeGateEnabled, runtimeHot, entryFile, visibleFiles],
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
        key={`${lessonId}-${effectiveTemplate}-${LAB_REACT_BOOTSTRAP_VERSION}`}
        template={effectiveTemplate}
        theme="dark"
        files={providerFiles}
        options={sandpackOptions}
      >
        <SyncStepTests stepId={stepId} testFiles={testFiles} />
        <LabPlaygroundInner
          stepId={stepId}
          onStepCheckPass={onStepCheckPass}
          onStepCheckFail={onStepCheckFail}
          hasTests={hasTests}
          expected={expected}
          testFiles={testFiles}
          runtimeGateEnabled={runtimeGateEnabled}
          runtimeHot={runtimeHot}
          setRuntimeHot={setRuntimeHot}
          setWantsRuntimeHot={setWantsRuntimeHot}
        />
      </SandpackProvider>
    </div>
  )
}
