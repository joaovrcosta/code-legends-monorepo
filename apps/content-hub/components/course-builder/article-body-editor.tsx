"use client";

import { useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code, Info, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const SNIPPETS = [
  {
    label: "Bloco de código",
    icon: Code,
    text: "```javascript\n// seu código aqui\n```",
  },
  {
    label: "Nota",
    icon: Info,
    text: "> **Nota**\n> \n",
  },
  {
    label: "Aviso",
    icon: AlertTriangle,
    text: "> **Aviso**\n> \n",
  },
  {
    label: "Dica",
    icon: Lightbulb,
    text: "> **Dica**\n> \n",
  },
] as const;

interface ArticleBodyEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function ArticleBodyEditor({
  id,
  value,
  onChange,
  placeholder = "Escreva o conteúdo em Markdown...",
  rows = 12,
}: ArticleBodyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        onChange(value + snippet);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const newValue = before + snippet + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = start + snippet.length;
        textarea.setSelectionRange(newPos, newPos);
      });
    },
    [value, onChange]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Conteúdo do artigo (Markdown)</Label>

      <div className="flex flex-wrap gap-2 mb-2">
        {SNIPPETS.map(({ label, icon: Icon, text }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertAtCursor(text)}
            className="gap-1.5"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="font-mono text-sm"
        placeholder={placeholder}
      />

      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Como formatar
          {showHelp ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
        </button>
        {showHelp && (
          <div className="px-3 pb-3 pt-0 text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>Bloco de código:</strong> use 3 crases, a linguagem (ex: <code className="rounded bg-gray-200 dark:bg-gray-700 px-1">javascript</code>), quebre linha, escreva o código e feche com 3 crases em uma nova linha. Não indente as crases.
            </p>
            <p>
              <strong>Callouts:</strong> use <code className="rounded bg-gray-200 dark:bg-gray-700 px-1">&gt; **Nota**</code>, <code className="rounded bg-gray-200 dark:bg-gray-700 px-1">&gt; **Aviso**</code> ou <code className="rounded bg-gray-200 dark:bg-gray-700 px-1">&gt; **Dica**</code> no início da linha, depois o texto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
