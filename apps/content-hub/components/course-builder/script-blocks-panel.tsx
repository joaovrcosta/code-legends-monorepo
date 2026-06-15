"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  parseScriptBlocks,
  scriptBlockTypeLabel,
  type ScriptBlock,
  type ScriptBlockType,
} from "@/lib/parse-script-blocks";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  X,
} from "lucide-react";

function blockTypeBadgeClass(type: ScriptBlockType): string {
  switch (type) {
    case "FALA":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case "PAUSA":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "CODIGO":
      return "border-violet-500/30 bg-violet-500/10 text-violet-300";
    default:
      return "border-white/10 bg-white/5 text-zinc-300";
  }
}

function truncatePreview(text: string, maxLen = 120): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen)}…`;
}

interface ScriptTeleprompterProps {
  blocks: ScriptBlock[];
  startIndex: number;
  lessonTitle: string;
  breadcrumb?: string;
  recordedIds: Set<string>;
  onToggleRecorded: (blockId: string) => void;
  onClose: () => void;
}

function ScriptTeleprompter({
  blocks,
  startIndex,
  lessonTitle,
  breadcrumb,
  recordedIds,
  onToggleRecorded,
  onClose,
}: ScriptTeleprompterProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(startIndex, 0), Math.max(blocks.length - 1, 0)),
  );
  const scrollRef = useRef<HTMLElement>(null);

  const activeBlock = blocks[activeIndex];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeIndex]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(blocks.length - 1, i + 1));
  }, [blocks.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onClose]);

  if (!activeBlock) return null;

  const isRecorded = recordedIds.has(activeBlock.id);

  return (
    <div
      className="fixed inset-0 z-60 flex flex-col bg-[#0a0a0b] text-zinc-100"
      role="dialog"
      aria-modal="true"
      aria-label="Teleprompter"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-zinc-200">
            {lessonTitle}
          </div>
          {breadcrumb ? (
            <div className="truncate text-xs text-zinc-500">{breadcrumb}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-zinc-400 sm:inline">
            Bloco {activeIndex + 1}/{blocks.length} •{" "}
            {scriptBlockTypeLabel(activeBlock.type)}
          </span>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs">
            <input
              type="checkbox"
              checked={isRecorded}
              onChange={() => onToggleRecorded(activeBlock.id)}
              className="h-3.5 w-3.5 rounded border-white/20"
            />
            Gravado
          </label>
          <Button variant="ghost" size="icon" onClick={onClose} title="Fechar (Esc)">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div
          className={[
            "mx-auto w-full max-w-4xl px-6 pt-10 pb-16 sm:px-12 sm:pt-12 sm:pb-20",
            "whitespace-pre-wrap text-center leading-relaxed",
            activeBlock.type === "CODIGO"
              ? "font-mono text-xl sm:text-2xl"
              : "text-2xl sm:text-3xl md:text-4xl",
            activeBlock.type === "PAUSA" ? "text-zinc-400 italic" : "text-zinc-100",
          ].join(" ")}
        >
          {activeBlock.content.trim() || (
            <span className="text-zinc-500">(pausa — sem texto)</span>
          )}
        </div>
      </main>

      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <span className="text-xs text-zinc-500 sm:hidden">
          {activeIndex + 1}/{blocks.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={activeIndex >= blocks.length - 1}
        >
          Próximo
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}

export interface ScriptBlocksPanelProps {
  notes: string;
  lessonTitle: string;
  breadcrumb?: string;
  recordedIds: Set<string>;
  onToggleRecorded: (blockId: string) => void;
  onMarkAllRecorded: (blockIds: string[]) => void;
  onClearRecorded: () => void;
}

export function ScriptBlocksPanel({
  notes,
  lessonTitle,
  breadcrumb,
  recordedIds,
  onToggleRecorded,
  onMarkAllRecorded,
  onClearRecorded,
}: ScriptBlocksPanelProps) {
  const blocks = useMemo(() => parseScriptBlocks(notes), [notes]);
  const [teleprompterStartIndex, setTeleprompterStartIndex] = useState<
    number | null
  >(null);

  const recordedCount = useMemo(
    () => blocks.filter((b) => recordedIds.has(b.id)).length,
    [blocks, recordedIds],
  );

  const progressPercent =
    blocks.length > 0 ? Math.round((recordedCount / blocks.length) * 100) : 0;

  if (blocks.length === 0) {
    return (
      <div className="flex min-h-[min(50vh,400px)] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
        <Clapperboard className="h-8 w-8 text-zinc-500" />
        <p className="text-sm text-zinc-300">
          Nenhum bloco encontrado no roteiro.
        </p>
        <p className="max-w-md text-xs text-zinc-500">
          Use tags como{" "}
          <code className="rounded bg-white/5 px-1">[FALA]</code>,{" "}
          <code className="rounded bg-white/5 px-1">[PAUSA]</code> ou{" "}
          <code className="rounded bg-white/5 px-1">[CÓDIGO NA TELA]</code> na
          aba Editor para estruturar o roteiro.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-zinc-200">
              Progresso da gravação
            </span>
            <span className="tabular-nums text-zinc-400">
              {recordedCount}/{blocks.length} blocos
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-lime-500 transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMarkAllRecorded(blocks.map((b) => b.id))}
          >
            Marcar todos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearRecorded}
            disabled={recordedCount === 0}
          >
            Limpar marcações
          </Button>
        </div>

        <ul className="space-y-2">
          {blocks.map((block, index) => {
            const isRecorded = recordedIds.has(block.id);
            return (
              <li key={block.id}>
                <div
                  className={[
                    "flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors",
                    isRecorded
                      ? "border-lime-500/20 bg-lime-500/5"
                      : "border-white/10 bg-black/20 hover:border-white/20",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={isRecorded}
                    onChange={() => onToggleRecorded(block.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20"
                    aria-label={`Marcar bloco ${index + 1} como gravado`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setTeleprompterStartIndex(index)}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        #{index + 1}
                      </span>
                      <span
                        className={[
                          "rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          blockTypeBadgeClass(block.type),
                        ].join(" ")}
                      >
                        {scriptBlockTypeLabel(block.type)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300">
                      {truncatePreview(block.content) || (
                        <span className="italic text-zinc-500">(vazio)</span>
                      )}
                    </p>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {teleprompterStartIndex != null && (
        <ScriptTeleprompter
          blocks={blocks}
          startIndex={teleprompterStartIndex}
          lessonTitle={lessonTitle}
          breadcrumb={breadcrumb}
          recordedIds={recordedIds}
          onToggleRecorded={onToggleRecorded}
          onClose={() => setTeleprompterStartIndex(null)}
        />
      )}
    </>
  );
}
