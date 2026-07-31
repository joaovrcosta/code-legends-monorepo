'use client'

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react'
import {
  labRuntimeMirrorPath,
  withLabAutoExports,
} from '@/lib/lab/lab-auto-exports'
import { pickStudentWorkspaceFiles } from '@/lib/lab/lab-workspace-files'
import {
  CHECK_START_DELAY_MS,
  CHECK_TIMEOUT_MS,
  CONSOLE_CAPTURE_AFTER_DONE_MS,
  CONSOLE_CAPTURE_GRACE_MS,
  CONSOLE_REFRESH_DELAY_MS,
  RESTORE_SETTLE_DELAY_MS,
  SETTLE_HARD_STOP_MS,
  STUDENT_CODE_PATHS,
  TRANSPILE_RETRY_DELAY_MS,
  VERIFY_CLICK_DEBOUNCE_MS,
} from '../constants'
import type { SandpackConsoleLog, SpecsMap, TestStatus } from '../types'
import { isManagedLabStepTestPath } from '../utils/file-paths'
import {
  countSpecResults,
  getSpecFileError,
} from '../utils/spec-results'

export type CheckState =
  | { phase: 'idle' }
  | { phase: 'checking'; startedAt: number }
  | { phase: 'settling' }
  | {
    phase: 'done'
    result: 'pass' | 'fail'
    error?: string
    showExpected: boolean
  }

type CheckAction =
  | { type: 'RESET' }
  | { type: 'START_CHECK' }
  | { type: 'ENTER_SETTLING' }
  | { type: 'RELEASE_CHECKING' }
  | {
    type: 'DONE'
    result: 'pass' | 'fail'
    error?: string
    showExpected: boolean
  }
  | { type: 'CLEAR_RESULT' }

function checkReducer(state: CheckState, action: CheckAction): CheckState {
  switch (action.type) {
    case 'RESET':
      return { phase: 'idle' }
    case 'START_CHECK':
      return { phase: 'checking', startedAt: Date.now() }
    case 'ENTER_SETTLING':
      if (state.phase === 'checking') return { phase: 'settling' }
      return state
    case 'RELEASE_CHECKING':
      // Só libera o botão; não apaga resultado já em `done` (fail após endChecking).
      if (state.phase === 'checking' || state.phase === 'settling') {
        return { phase: 'idle' }
      }
      return state
    case 'DONE':
      return {
        phase: 'done',
        result: action.result,
        error: action.error,
        showExpected: action.showExpected,
      }
    case 'CLEAR_RESULT':
      if (state.phase === 'done' || state.phase === 'idle') {
        return { phase: 'idle' }
      }
      return state
    default:
      return state
  }
}

type ListenFn = (handler: (msg: unknown) => void) => () => void

type SandpackLike = {
  files: Record<string, { code?: string } | undefined>
  updateFile: (path: string, code: string) => void
  deleteFile?: (path: string) => void
}

export function useCheckFlow({
  stepId,
  isLastStep = false,
  expected,
  hasTests,
  testFiles,
  onStepCheckPass,
  onStepCheckFail,
  sandpackRef,
  listenRef,
  refreshPreview,
  invalidateJestRef,
  wakeRuntime,
  setRightTab,
  consoleCapture,
  onVerifyAttempt,
}: {
  stepId: string
  /** Último step: onPass imediato sem holdUntilSettled. */
  isLastStep?: boolean
  expected?: string
  hasTests: boolean
  testFiles: Record<string, string>
  onStepCheckPass: (stepId: string) => void
  onStepCheckFail?: (stepId: string) => void
  sandpackRef: MutableRefObject<SandpackLike>
  listenRef: MutableRefObject<ListenFn>
  refreshPreview: () => void
  invalidateJestRef: MutableRefObject<(() => void) | null>
  wakeRuntime: (mode: 'run' | 'refresh') => void
  setRightTab: Dispatch<
    SetStateAction<'preview' | 'console' | 'tests' | null>
  >
  consoleCapture: ReturnType<
    typeof import('./use-verify-console-capture').useVerifyConsoleCapture
  >
  onVerifyAttempt?: (payload: {
    stepId: string
    result: 'pass' | 'fail' | 'timeout' | 'error'
    files: Record<string, string>
  }) => void
}) {
  const [checkState, dispatchCheck] = useReducer(checkReducer, {
    phase: 'idle',
  })
  const checking =
    checkState.phase === 'checking' || checkState.phase === 'settling'
  const checkError =
    checkState.phase === 'done' ? (checkState.error ?? null) : null
  const showExpected =
    checkState.phase === 'done' ? checkState.showExpected : false

  const [checkId, setCheckId] = useState(0)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [liveSpecs, setLiveSpecs] = useState<SpecsMap>({})

  const checkingRef = useRef(false)
  const checkPhaseRef = useRef(checkState.phase)
  checkPhaseRef.current = checkState.phase
  const passCalledRef = useRef(false)
  const lastVerifyClickRef = useRef(0)
  const stepIdRef = useRef(stepId)
  const isLastStepRef = useRef(isLastStep)
  const onPassRef = useRef(onStepCheckPass)
  const onFailRef = useRef(onStepCheckFail)
  const onVerifyAttemptRef = useRef(onVerifyAttempt)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Hard-stop do settle (holdUntilSettled) — força release se timers forem clobberizados. */
  const hardStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expectedCheckIdRef = useRef(0)
  const transpileRetryCountRef = useRef(0)
  /** Paths dos espelhos `*.__lab_check.js` criados no Verificar (não o App.js). */
  const preCheckMirrorsRef = useRef<string[] | null>(null)
  const bundlerErrorRef = useRef(false)

  const testFilesRef = useRef(testFiles)
  testFilesRef.current = testFiles

  const {
    consoleSessionId,
    setConsoleSessionId,
    consoleCapturing,
    setConsoleCapturing,
    verifyConsoleLogsRef,
    handleCaptureLogsChange,
    clearConsoleFreeze,
    consoleFreezeRef,
    consoleCaptureStartRef,
    consoleRefreshDelayRef,
    endCheckingUnsubRef,
    endCheckingGenRef,
  } = consoleCapture

  stepIdRef.current = stepId
  isLastStepRef.current = isLastStep
  onPassRef.current = onStepCheckPass
  onFailRef.current = onStepCheckFail
  onVerifyAttemptRef.current = onVerifyAttempt

  const emitVerifyAttempt = useCallback(
    (result: 'pass' | 'fail' | 'timeout' | 'error') => {
      try {
        const files = pickStudentWorkspaceFiles(
          sandpackRef.current.files as Record<
            string,
            { code?: string } | undefined
          >,
        )
        onVerifyAttemptRef.current?.({
          stepId: stepIdRef.current,
          result,
          files,
        })
      } catch {
        // best-effort
      }
    },
    [sandpackRef],
  )

  useEffect(() => {
    checkingRef.current = checking
  }, [checking])

  const notifyFail = useCallback(() => {
    onFailRef.current?.(stepIdRef.current)
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

  const clearHardStop = useCallback(() => {
    if (hardStopRef.current) {
      clearTimeout(hardStopRef.current)
      hardStopRef.current = null
    }
  }, [])

  const restoreStudentFiles = useCallback(() => {
    const mirrors = preCheckMirrorsRef.current
    if (!mirrors?.length) return
    for (const path of mirrors) {
      try {
        if (typeof sandpackRef.current.deleteFile === 'function') {
          sandpackRef.current.deleteFile(path)
        } else {
          sandpackRef.current.updateFile(path, '/* lab runtime mirror cleared */\n')
        }
      } catch {
        try {
          sandpackRef.current.updateFile(
            path,
            '/* lab runtime mirror cleared */\n',
          )
        } catch {
          // ignore
        }
      }
    }
    preCheckMirrorsRef.current = null
  }, [sandpackRef])

  /**
   * Escreve auto-export num espelho oculto (`/App.__lab_check.js`).
   * Não altera o arquivo visível — evita a piscada do `export { ... }` no editor.
   */
  const prepareStudentFilesForCheck = useCallback(() => {
    const mirrors: string[] = []
    for (const path of STUDENT_CODE_PATHS) {
      const file = sandpackRef.current.files[path]
      if (!file?.code) continue
      const next = withLabAutoExports(file.code)
      if (next === file.code) continue
      const mirror = labRuntimeMirrorPath(path)
      try {
        sandpackRef.current.updateFile(mirror, next)
        mirrors.push(mirror)
      } catch {
        // ignore
      }
    }
    preCheckMirrorsRef.current = mirrors
  }, [sandpackRef])

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
  }, [sandpackRef, testFiles])

  const failCheck = useCallback(
    (error: string | undefined, showExpectedFlag: boolean) => {
      dispatchCheck({
        type: 'DONE',
        result: 'fail',
        error,
        showExpected: showExpectedFlag,
      })
      notifyFail()
    },
    [notifyFail],
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
      clearStartDelay()
      // Novo Verificar chama clearConsoleFreeze e aborta refresh órfão (evita stuck).
      clearConsoleFreeze()
      const gen = endCheckingGenRef.current
      const holdUntilSettled = Boolean(options?.holdUntilSettled)

      // NÃO limpar o watchdog aqui quando holdUntilSettled: ele é o backstop
      // que garante o release do botão se settle() nunca rodar (timers
      // clobberizados por um ciclo novo). Só é limpo dentro de settle().
      if (!holdUntilSettled) {
        clearCheckTimeout()
        checkingRef.current = false
        dispatchCheck({ type: 'RELEASE_CHECKING' })
      } else {
        dispatchCheck({ type: 'ENTER_SETTLING' })
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
        // Guard primeiro: ciclo morto / double-call não mexe em nada
        if (settled || endCheckingGenRef.current !== gen) return
        settled = true
        // Limpa hard-stop (também quando settle veio pelo próprio hard-stop)
        if (hardStopRef.current) {
          clearTimeout(hardStopRef.current)
          hardStopRef.current = null
        }
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
        clearCheckTimeout()
        if (holdUntilSettled) {
          checkingRef.current = false
          dispatchCheck({ type: 'RELEASE_CHECKING' })
        }
        setConsoleCapturing(false)
        const after = options?.onSettled
        if (after) {
          window.setTimeout(after, 0)
        }
      }

      const scheduleSettle = (delayMs: number) => {
        if (consoleFreezeRef.current) {
          clearTimeout(consoleFreezeRef.current)
          consoleFreezeRef.current = null
        }
        consoleFreezeRef.current = setTimeout(settle, delayMs)
      }

      endCheckingUnsubRef.current = listenRef.current((msg) => {
        if (endCheckingGenRef.current !== gen || settled || !refreshDispatched) {
          return
        }
        const data = msg as { type?: string }
        if (data.type !== 'done' && data.type !== 'success') return
        scheduleSettle(CONSOLE_CAPTURE_AFTER_DONE_MS)
      })

      const scheduleConsoleRefresh = () => {
        consoleRefreshDelayRef.current = setTimeout(() => {
          consoleRefreshDelayRef.current = null
          if (settled || endCheckingGenRef.current !== gen) return
          refreshDispatched = true
          refreshPreview()
          // Refresh pode matar o client Jest — próximo Verificar espera initialize.
          invalidateJestRef.current?.()
        }, CONSOLE_REFRESH_DELAY_MS)
      }

      // Delay: deixa o rebundle do restore terminar; reset de novo + 1 refresh.
      consoleCaptureStartRef.current = setTimeout(() => {
        consoleCaptureStartRef.current = null
        if (settled || endCheckingGenRef.current !== gen) return
        // Novo bump força reset do LabVerifyConsole após logs do restore.
        setConsoleSessionId((id) => id + 1)
        setConsoleCapturing(true)
        scheduleConsoleRefresh()
      }, RESTORE_SETTLE_DELAY_MS)

      scheduleSettle(CONSOLE_CAPTURE_GRACE_MS)

      // Hard-stop: força settle se timers internos forem clobberizados.
      if (hardStopRef.current) {
        clearTimeout(hardStopRef.current)
        hardStopRef.current = null
      }
      hardStopRef.current = setTimeout(() => {
        hardStopRef.current = null
        if (endCheckingGenRef.current !== gen) return
        settle()
      }, SETTLE_HARD_STOP_MS)
    },
    [
      clearCheckTimeout,
      clearStartDelay,
      clearConsoleFreeze,
      restoreStudentFiles,
      refreshPreview,
      listenRef,
      invalidateJestRef,
      setRightTab,
      setConsoleSessionId,
      setConsoleCapturing,
      endCheckingGenRef,
      consoleFreezeRef,
      consoleCaptureStartRef,
      consoleRefreshDelayRef,
      endCheckingUnsubRef,
    ],
  )

  useEffect(() => {
    passCalledRef.current = false
    transpileRetryCountRef.current = 0
    expectedCheckIdRef.current = 0
    lastVerifyClickRef.current = 0
    dispatchCheck({ type: 'RESET' })
    checkingRef.current = false
    setTestStatus('idle')
    setLiveSpecs({})
    verifyConsoleLogsRef.current = []
    bundlerErrorRef.current = false
    clearConsoleFreeze()
    restoreStudentFiles()
    clearCheckTimeout()
    clearStartDelay()
    clearHardStop()
  }, [
    stepId,
    clearCheckTimeout,
    clearStartDelay,
    clearHardStop,
    clearConsoleFreeze,
    restoreStudentFiles,
    verifyConsoleLogsRef,
  ])

  useEffect(
    () => () => {
      clearCheckTimeout()
      clearStartDelay()
      clearHardStop()
      clearConsoleFreeze()
      restoreStudentFiles()
    },
    [
      clearCheckTimeout,
      clearStartDelay,
      clearHardStop,
      clearConsoleFreeze,
      restoreStudentFiles,
    ],
  )

  const scheduleCheckTimeout = useCallback(() => {
    clearCheckTimeout()
    timeoutRef.current = setTimeout(() => {
      if (!checkingRef.current) return
      // Não sobrescrever pass já em settle (holdUntilSettled).
      if (checkPhaseRef.current === 'settling') return
      endChecking()
      dispatchCheck({
        type: 'DONE',
        result: 'fail',
        error:
          'Tempo esgotado. Espere o editor carregar e clique em Verificar de novo.',
        showExpected: false,
      })
      emitVerifyAttempt('timeout')
      notifyFail()
    }, CHECK_TIMEOUT_MS)
  }, [clearCheckTimeout, endChecking, notifyFail, emitVerifyAttempt])

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
    dispatchCheck({ type: 'CLEAR_RESULT' })
    dispatchCheck({ type: 'START_CHECK' })
    passCalledRef.current = false
    transpileRetryCountRef.current = 0
    verifyConsoleLogsRef.current = []
    bundlerErrorRef.current = false
    // Console só captura depois dos testes (em endChecking).
    setConsoleCapturing(false)
    scheduleCheckTimeout()

    clearStartDelay()
    // Espelho oculto com auto-export + Jest. O App.js visível não muda.
    startDelayRef.current = setTimeout(() => {
      startDelayRef.current = null
      if (!checkingRef.current) return
      prepareStudentFilesForCheck()
      syncActiveTestFiles()
      bumpCheckId()
    }, CHECK_START_DELAY_MS)
  }, [
    prepareStudentFilesForCheck,
    syncActiveTestFiles,
    scheduleCheckTimeout,
    clearStartDelay,
    clearConsoleFreeze,
    bumpCheckId,
    setRightTab,
    setConsoleCapturing,
    verifyConsoleLogsRef,
  ])

  const finishCheck = useCallback(
    (specs: SpecsMap, completedCheckId: number) => {
      if (!checkingRef.current) return
      // Ignora resultado de uma run antiga (clique duplo / retry sobreposto).
      if (completedCheckId !== expectedCheckIdRef.current) return

      // Testes terminaram — não deixar o watchdog marcar timeout no settle.
      clearCheckTimeout()

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
          TRANSPILE_RETRY_DELAY_MS[transpileRetryCountRef.current - 1] ??
          TRANSPILE_RETRY_DELAY_MS[TRANSPILE_RETRY_DELAY_MS.length - 1]
        scheduleCheckTimeout()
        clearStartDelay()
        startDelayRef.current = setTimeout(() => {
          startDelayRef.current = null
          if (!checkingRef.current) return
          prepareStudentFilesForCheck()
          syncActiveTestFiles()
          bumpCheckId()
        }, delayMs)
        return
      }

      // Pass: captura o console antes de avançar o step (senão clearConsoleFreeze
      // no effect do stepId cancela a captura e o console fica vazio).
      // Fail: endChecking libera o botão na hora (sem esperar ~2s de captura).
      // Último step: stepId não muda no onPass — libera botão + completeLesson já;
      // captura segue em background (resultado órfão é aceitável).
      if (passedAll) {
        emitVerifyAttempt('pass')
        if (isLastStepRef.current) {
          if (!passCalledRef.current) {
            passCalledRef.current = true
            onPassRef.current(passedStepId)
          }
          // DONE antes do RELEASE: reducer ignora RELEASE quando já está em done.
          dispatchCheck({
            type: 'DONE',
            result: 'pass',
            showExpected: false,
          })
          endChecking({ holdUntilSettled: false })
          return
        }
        endChecking({
          holdUntilSettled: true,
          onSettled: () => {
            dispatchCheck({
              type: 'DONE',
              result: 'pass',
              showExpected: false,
            })
            if (!passCalledRef.current) {
              passCalledRef.current = true
              onPassRef.current(passedStepId)
            }
          },
        })
        return
      }

      emitVerifyAttempt('fail')
      endChecking()

      if (fileError) {
        failCheck(
          transpilePending
            ? 'O código ainda estava compilando. Clique em Verificar de novo.'
            : `Erro nos testes: ${fileError}`,
          hasExpected,
        )
        return
      }

      if (total === 0) {
        failCheck(
          'Nenhum teste encontrado. Confira o arquivo *.test.js do step.',
          hasExpected,
        )
        return
      }

      failCheck(
        hasExpected ? undefined : 'Resposta incorreta. Tente de novo.',
        hasExpected,
      )
    },
    [
      endChecking,
      scheduleCheckTimeout,
      clearStartDelay,
      clearCheckTimeout,
      bumpCheckId,
      syncActiveTestFiles,
      prepareStudentFilesForCheck,
      expected,
      failCheck,
      emitVerifyAttempt,
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

  const handleCheckWork = useCallback(() => {
    const now = Date.now()
    if (now - lastVerifyClickRef.current < VERIFY_CLICK_DEBOUNCE_MS) return
    if (checkingRef.current || checking) return
    lastVerifyClickRef.current = now

    if (!hasTests) {
      // Sem testes: wake + refresh único (captura console)
      checkingRef.current = true
      dispatchCheck({ type: 'START_CHECK' })
      wakeRuntime('refresh')
      clearConsoleFreeze()
      verifyConsoleLogsRef.current = []
      bundlerErrorRef.current = false
      setConsoleSessionId((id) => id + 1)
      setConsoleCapturing(true)
      setRightTab('console')
      dispatchCheck({ type: 'CLEAR_RESULT' })
      consoleFreezeRef.current = setTimeout(() => {
        consoleFreezeRef.current = null
        setConsoleCapturing(false)
        checkingRef.current = false
        dispatchCheck({ type: 'RELEASE_CHECKING' })
        const consoleFailed = verifyConsoleLogsRef.current.some(
          (log: SandpackConsoleLog) => log.method === 'error',
        )
        if (consoleFailed || bundlerErrorRef.current) {
          failCheck(
            'Erro no código — corrija antes de continuar.',
            Boolean(expected?.trim()),
          )
          return
        }
        if (!passCalledRef.current) {
          passCalledRef.current = true
          dispatchCheck({ type: 'DONE', result: 'pass', showExpected: false })
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
    failCheck,
    wakeRuntime,
    setRightTab,
    setConsoleSessionId,
    setConsoleCapturing,
    verifyConsoleLogsRef,
    consoleFreezeRef,
  ])

  const clearCheckResult = useCallback(() => {
    dispatchCheck({ type: 'CLEAR_RESULT' })
  }, [])

  return {
    checking,
    checkError,
    showExpected,
    checkId,
    testStatus,
    liveSpecs,
    consoleSessionId,
    consoleCapturing,
    clearCheckResult,
    handleCaptureLogsChange,
    handleBundlerError,
    handleCheckWork,
    handleTestsComplete,
    handleStatusChange,
  }
}