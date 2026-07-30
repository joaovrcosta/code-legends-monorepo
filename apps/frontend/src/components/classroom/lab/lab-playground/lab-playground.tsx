'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { SandpackProvider } from '@codesandbox/sandpack-react'
import {
  LAB_TEST_HELPERS_PATH,
  buildLabTestHelpersSource,
} from '@/lib/lab/lab-test-helpers-source'
import { isLabSandpackRuntimeGateEnabled } from '@/lib/lab/lab-feature-flags'
import { LAB_REACT_BOOTSTRAP_VERSION, RUNTIME_COLD_DEBOUNCE_MS } from './constants'
import { LabPlaygroundInner } from './lab-playground-inner'
import { SyncStepTests } from './sync-step-tests'
import {
  applyHiddenFlags,
  getStudentVisibleFiles,
  resolveTestFiles,
} from './utils/file-paths'

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
  /** Reset de progresso/instruções ao confirmar Restaurar. */
  onRestoreLab?: () => void
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
  onRestoreLab,
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

  /** Só arquivos visíveis do aluno — Restaurar não mexe em testes/helpers. */
  const starterStudentFiles = useMemo(() => {
    const out: Record<string, string> = {}
    for (const path of visibleFiles) {
      const code = initialPlainFiles[path]
      if (typeof code === 'string') out[path] = code
    }
    return out
  }, [visibleFiles, initialPlainFiles])

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
          onRestoreLab={onRestoreLab}
          hasTests={hasTests}
          expected={expected}
          testFiles={testFiles}
          starterStudentFiles={starterStudentFiles}
          runtimeGateEnabled={runtimeGateEnabled}
          runtimeHot={runtimeHot}
          setRuntimeHot={setRuntimeHot}
          setWantsRuntimeHot={setWantsRuntimeHot}
        />
      </SandpackProvider>
    </div>
  )
}
