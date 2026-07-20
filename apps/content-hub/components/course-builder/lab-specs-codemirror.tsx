'use client'

import Editor from '@monaco-editor/react'

type LabSpecsCodemirrorProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
}

export function LabSpecsCodemirror({
  value,
  onChange,
  onBlur,
  className,
}: LabSpecsCodemirrorProps) {
  return (
    <div
      className={`overflow-hidden rounded-md ${className ?? ''}`}
      onBlur={onBlur}
    >
      <Editor
        height="360px"
        defaultLanguage="json"
        language="json"
        theme="vs-dark"
        value={value}
        onChange={(next) => onChange(next ?? '')}
        loading={
          <div className="flex h-[360px] items-center justify-center bg-[#1e1e1e] text-sm text-ch-muted">
            Carregando editor…
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          bracketPairColorization: { enabled: true },
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  )
}
