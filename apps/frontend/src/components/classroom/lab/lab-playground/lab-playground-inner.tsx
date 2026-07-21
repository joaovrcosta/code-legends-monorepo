'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { Folder, FolderOpen } from '@phosphor-icons/react'
import { Loader2, RotateCcw } from 'lucide-react'
import { LabSandpackBundlerErrorListener } from './lab-sandpack-bundler-error-listener'
import { LabJestRunner } from './lab-jest-runner'
import { LabVerifyConsole } from './lab-verify-console'
import { LabTestsPanel } from './lab-tests-panel'
import { useSandpackRuntimeWake } from './hooks/use-sandpack-runtime-wake'
import { useVerifyConsoleCapture } from './hooks/use-verify-console-capture'
import { useCheckFlow } from './hooks/use-check-flow'

export function LabPlaygroundInner({
  stepId,
  onStepCheckPass,
  onStepCheckFail,
  hasTests,
  expected,
  testFiles,
  starterStudentFiles,
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
  /** Código inicial visível do lab (specs.files) — botão Restaurar. */
  starterStudentFiles: Record<string, string>
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

  /** null = só editor; usuário abre Result/Console/Testes pelos botões */
  const [rightTab, setRightTab] = useState<
    'preview' | 'console' | 'tests' | null
  >(null)
  /** Pasta fechada por padrão; fechar NÃO reseta activeFile. */
  const [filesOpen, setFilesOpen] = useState(false)
  const [restoreSpinning, setRestoreSpinning] = useState(false)

  const refreshPreview = useCallback(() => {
    try {
      dispatchRef.current({ type: 'refresh' })
    } catch {
      // ignore
    }
  }, [])

  const { wakeRuntime } = useSandpackRuntimeWake({
    runtimeGateEnabled,
    setRuntimeHot,
    setWantsRuntimeHot,
    listenRef,
    sandpackRef,
    refreshPreview,
  })

  const consoleCapture = useVerifyConsoleCapture()

  const {
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
  } = useCheckFlow({
    stepId,
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
  })

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

  const handleRestoreStarter = useCallback(() => {
    if (checking || restoreSpinning) return
    const entries = Object.entries(starterStudentFiles)
    if (entries.length === 0) return

    setRestoreSpinning(true)
    window.setTimeout(() => setRestoreSpinning(false), 500)

    for (const [path, code] of entries) {
      try {
        sandpackRef.current.updateFile(path, code)
      } catch {
        // ignore
      }
    }
    clearCheckResult()
    // Atualiza preview/console com o código restaurado.
    wakeRuntime('refresh')
  }, [
    checking,
    restoreSpinning,
    starterStudentFiles,
    clearCheckResult,
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
        <button
          type="button"
          onClick={handleRestoreStarter}
          disabled={
            checking ||
            restoreSpinning ||
            Object.keys(starterStudentFiles).length === 0
          }
          title="Restaura o código inicial do lab"
          aria-label="Restaurar código inicial"
          className="inline-flex items-center justify-center gap-1.5 rounded-[16px] border border-white/20 px-3 h-[42px] py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCcw
            className={`h-5 w-5 motion-reduce:transition-none ${restoreSpinning
              ? 'transition-transform duration-500 ease-out -rotate-[360deg]'
              : 'rotate-0'
              }`}
            aria-hidden
          />
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
