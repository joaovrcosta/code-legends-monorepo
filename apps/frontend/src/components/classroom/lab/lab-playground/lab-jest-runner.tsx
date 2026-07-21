'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from 'react'
import { useSandpackClient } from '@codesandbox/sandpack-react'
import {
  CLIENT_MAX_ATTEMPTS,
  CLIENT_POLL_MS,
  JEST_TRY_RUN_INITIAL_DELAY_MS,
} from './constants'
import type { SpecsMap, TestStatus } from './types'

export function LabJestRunner({
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

    window.setTimeout(tryRun, JEST_TRY_RUN_INITIAL_DELAY_MS)

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
