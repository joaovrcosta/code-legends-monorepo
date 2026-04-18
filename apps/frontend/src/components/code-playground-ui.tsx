'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackTests,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { ArrowsClockwise, PencilSimple, SidebarSimple } from '@phosphor-icons/react'

const DEFAULT_FILES = {
  '/index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/styles.css" />
  <title>Playground</title>
</head>
<body>
  <div class="box">Hello world!</div>
</body>
</html>`,
  '/styles.css': `/* Decorative styles */
.box {
  padding: 24px;
  border-radius: 2px;
  background-color: #F95039;
  color: white;
  font-family: system-ui, sans-serif;
}`,
}

type RightPanelTab = 'result' | 'tests'

function PreviewToolbar({
  activeTab,
  onTabChange,
  hasTests,
}: {
  activeTab: RightPanelTab
  onTabChange: (tab: RightPanelTab) => void
  hasTests: boolean
}) {
  const { sandpack } = useSandpack()
  return (
    <div className="flex items-center justify-between border-b border-[#25252A] bg-[#373A3E] px-3 py-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTabChange('result')}
          className={`text-sm font-medium ${
            activeTab === 'result'
              ? 'text-white border-b-2 border-white/80'
              : 'text-white/70 hover:text-white'
          }`}
        >
          RESULT
        </button>
        {hasTests && (
          <button
            type="button"
            onClick={() => onTabChange('tests')}
            className={`text-sm font-medium ${
              activeTab === 'tests'
                ? 'text-white border-b-2 border-white/80'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Testes
          </button>
        )}
      </div>
      {activeTab === 'result' && (
        <button
          type="button"
          onClick={() => sandpack.resetAllFiles()}
          className="rounded p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Recarregar preview"
        >
          <ArrowsClockwise className="h-4 w-4" weight="bold" />
        </button>
      )}
    </div>
  )
}

function PlaygroundContent({
  hasTests,
  onTestsPass,
  playgroundId,
}: {
  hasTests: boolean
  onTestsPass?: () => void
  playgroundId?: string
}) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('result')
  const { listen } = useSandpack()
  const onTestsPassRef = useRef(onTestsPass)
  const calledRef = useRef(false)
  onTestsPassRef.current = onTestsPass

  useEffect(() => {
    if (!listen || !hasTests || !onTestsPassRef.current) return
    const unsub = listen((msg: unknown) => {
      const m = msg as { type?: string; status?: string; payload?: { passed?: number; total?: number } }
      if (m?.type === 'test' && m?.status === 'complete' && m?.payload?.passed != null && m?.payload?.total != null && m.payload.passed === m.payload.total) {
        if (!calledRef.current) {
          calledRef.current = true
          onTestsPassRef.current?.()
        }
      }
    })
    return () => { unsub?.() }
  }, [listen, hasTests])

  const handleManualPass = useCallback(() => {
    if (!calledRef.current) {
      calledRef.current = true
      onTestsPassRef.current?.()
    }
  }, [])

  return (
    <SandpackLayout>
      <SandpackCodeEditor />
      <div className="flex min-h-0 flex-1 flex-col">
        <PreviewToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasTests={hasTests}
        />
        <div className="min-h-0 flex-1 bg-white">
          {activeTab === 'result' && (
            <SandpackPreview
              showRefreshButton={false}
              showNavigator={false}
            />
          )}
          {activeTab === 'tests' && hasTests && (
            <div className="flex h-full flex-col">
              <SandpackTests />
              {playgroundId && onTestsPass && (
                <div className="border-t border-[#25252A] bg-[#373A3E] px-3 py-2">
                  <button
                    type="button"
                    onClick={handleManualPass}
                    className="text-xs text-white/80 hover:text-white"
                  >
                    Já passei nos testes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SandpackLayout>
  )
}

export interface CodePlaygroundProps {
  /** Arquivos iniciais (path -> conteúdo). Default: HTML + CSS com "Hello world!" e estilo coral. */
  files?: Record<string, string>
  /** Template do Sandpack. Default: "vanilla". Com testes, usa "react". */
  template?: 'vanilla' | 'react'
  /** Altura do bloco (ex.: 300 ou "400px"). */
  height?: number | string
  /** Classes adicionais no container raiz. */
  className?: string
  /** Conteúdo do arquivo de testes (ex.: App.test.js). Quando definido, exibe aba "Testes" e bloqueia conclusão do artigo até passar. */
  testFile?: string
  /** Arquivos de teste por path. Alternativa a testFile (um único arquivo). */
  tests?: Record<string, string>
  /** Chamado quando todos os testes passam (para desbloquear "Marcar como concluído" no artigo). */
  onTestsPass?: () => void
  /** Id único do playground no artigo (para o artigo rastrear quais já passaram). */
  playgroundId?: string
}

const REACT_TEMPLATE_DEFAULT_FILES: Record<string, string> = {
  '/App.js': `export default function App() {
  return <div className="box">Hello world!</div>;
}`,
  '/public/index.html': `<!DOCTYPE html>
<html>
<head><title>Playground</title></head>
<body><div id="root"></div></body>
</html>`,
  '/styles.css': `.box { padding: 24px; border-radius: 2px; background-color: #F95039; color: white; }`,
  '/index.js': `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<StrictMode><App /></StrictMode>);`,
}

export function CodePlayground({
  files,
  template = 'vanilla',
  height = 320,
  className = '',
  testFile,
  tests,
  onTestsPass,
  playgroundId,
}: CodePlaygroundProps) {
  const hasTests = Boolean(testFile || (tests && Object.keys(tests).length > 0))
  const effectiveTemplate = hasTests ? 'react' : template
  const baseFiles = effectiveTemplate === 'react' ? REACT_TEMPLATE_DEFAULT_FILES : (files ?? DEFAULT_FILES)
  const testFiles = testFile ? { '/App.test.js': testFile } : tests ?? {}
  const resolvedFiles = { ...baseFiles, ...(files ?? {}), ...testFiles }
  const heightValue = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-[#25252A] bg-[#1A1A1A] ${className}`}
      style={{ height: heightValue, minHeight: heightValue }}
    >
      <div className="flex items-center justify-between border-b border-[#25252A] bg-[#373A3E] px-4 py-2.5">
        <span className="text-sm font-medium text-white">Code Playground</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Editar"
          >
            <PencilSimple className="h-4 w-4" weight="bold" />
          </button>
          <button
            type="button"
            className="rounded p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Recolher"
          >
            <SidebarSimple className="h-4 w-4" weight="bold" />
          </button>
        </div>
      </div>

      <SandpackProvider
        template={effectiveTemplate}
        theme="dark"
        files={resolvedFiles}
        options={{
          classes: {
            'sp-wrapper': '!h-full !min-h-0 !rounded-none !border-0 !bg-transparent',
            'sp-layout': '!h-full !min-h-0 !flex !flex-row !border-0 !bg-[#1A1A1A]',
            'sp-stack': '!h-full !bg-[#1A1A1A] !min-h-0',
            'sp-tabs': '!border-b !border-[#25252A] !bg-[#1A1A1A]',
            'sp-tab-button':
              '!text-white/70 !data-[active=true]:text-white !data-[active=true]:border-b-2 !data-[active=true]:border-white/80',
            'sp-code-editor': '!bg-[#1A1A1A]',
            'sp-preview-container': '!border-l !border-[#25252A] !bg-[#1A1A1A]',
          },
        }}
      >
        <PlaygroundContent
          hasTests={hasTests}
          onTestsPass={onTestsPass}
          playgroundId={playgroundId}
        />
      </SandpackProvider>
    </div>
  )
}
