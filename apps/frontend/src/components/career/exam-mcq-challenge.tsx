"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Challenge } from "@/types/roadmap";
import { cn } from "@/lib/utils";

const CodeBlockHighlighter = dynamic(
  () =>
    import("@/components/classroom/article/CodeBlockHighlighter").then(
      (m) => m.CodeBlockHighlighter,
    ),
  { ssr: false },
);

function normalizeAnswer(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function checkAnswer(challenge: Challenge, answer: string): boolean {
  const norm = normalizeAnswer(answer);
  if (challenge.correctAnswer !== undefined) {
    if (normalizeAnswer(challenge.correctAnswer) === norm) return true;
  }
  if (challenge.correctAnswers) {
    return challenge.correctAnswers.some((a) => normalizeAnswer(a) === norm);
  }
  return false;
}

function isOptionCorrect(challenge: Challenge, option: string): boolean {
  return checkAnswer(challenge, option);
}

/** Múltipla escolha no fluxo de exame da carreira (com ou sem tipo `exam_mcq`). */
export function isCareerExamMultipleChoice(challenge: Challenge): boolean {
  const opts = challenge.options;
  const hasOptions = Array.isArray(opts) && opts.length > 0;
  if (!hasOptions) return false;
  if (challenge.type === "exam_mcq") return true;
  return (
    challenge.type === "conceptual" ||
    challenge.type === "prediction" ||
    challenge.type === "bug"
  );
}

export function ExamMcqChallenge({
  challenge,
  onAnswer,
  onNext,
}: {
  challenge: Challenge;
  onAnswer?: (correct: boolean) => void;
  /** No exame: avança questão. Em artigo/lição sem `onNext`, “Continuar” só reinicia o estado local. */
  onNext?: () => void;
}) {
  const options = challenge.options ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const answerReported = useRef(false);

  const handleConfirm = useCallback(() => {
    if (submitted || selected === null) return;
    const correct = checkAnswer(challenge, selected);
    setIsCorrect(correct);
    setSubmitted(true);
    if (!answerReported.current) {
      answerReported.current = true;
      onAnswer?.(correct);
    }
  }, [submitted, selected, challenge, onAnswer]);

  const handleContinue = useCallback(() => {
    if (!submitted) return;
    if (onNext) {
      onNext();
      return;
    }
    setSubmitted(false);
    setSelected(null);
    setIsCorrect(null);
    answerReported.current = false;
  }, [submitted, onNext]);

  return (
    <div className="mx-auto w-full max-w-[640px] px-1 py-2">
      <h2 className="text-lg font-normal leading-snug tracking-tight text-white md:text-xl">
        {challenge.question}
      </h2>

      {challenge.code ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0a0c]">
          <CodeBlockHighlighter
            code={challenge.code}
            language={challenge.language ?? "tsx"}
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        {options.map((option, i) => {
          const letter = String.fromCharCode(65 + i);
          const isThisCorrect = submitted && isOptionCorrect(challenge, option);
          const isThisWrong = submitted && selected === option && !isCorrect;

          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => !submitted && setSelected(option)}
              className={cn(
                "w-full rounded-lg border px-4 py-3.5 text-left text-[15px] leading-snug transition-colors md:py-4",
                "border-white/[0.12] bg-transparent text-[#e8e8ed]",
                !submitted && selected === option && "border-[#00C8FF]/50 bg-[#00C8FF]/[0.06]",
                !submitted &&
                  selected !== option &&
                  "hover:border-white/[0.2] hover:bg-white/[0.03]",
                submitted && "cursor-default",
                isThisCorrect &&
                  "border-emerald-500/55 bg-emerald-500/[0.08] text-emerald-100",
                isThisWrong && "border-rose-500/50 bg-rose-500/[0.08] text-rose-100",
                submitted &&
                  !isThisCorrect &&
                  !isThisWrong &&
                  "border-white/[0.06] text-[#6b6b76]",
              )}
            >
              <span className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                    submitted && isThisCorrect && "border-emerald-400/60 text-emerald-200",
                    submitted && isThisWrong && "border-rose-400/60 text-rose-200",
                    !submitted &&
                      selected === option &&
                      "border-[#00C8FF]/70 text-[#7ee9ff]",
                    !submitted &&
                      selected !== option &&
                      "border-white/20 text-[#9ca3af]",
                  )}
                >
                  {letter}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">{option}</span>
              </span>
            </button>
          );
        })}
      </div>

      {submitted && challenge.explanation?.trim() ? (
        <p className="mt-6 text-sm leading-relaxed text-[#9b9ba8]">
          {challenge.explanation}
        </p>
      ) : null}

      <div className="mt-10 flex justify-end">
        {!submitted ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected === null}
            className={cn(
              "min-h-[44px] rounded-full px-8 text-sm font-semibold transition-all",
              "bg-blue-gradient-500 text-black shadow-none",
              "hover:shadow-[0_0_14px_rgba(0,200,255,0.35)]",
              "disabled:cursor-not-allowed disabled:opacity-35",
            )}
          >
            Confirmar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className={cn(
              "min-h-[44px] rounded-full px-8 text-sm font-semibold transition-all",
              "bg-blue-gradient-500 text-black",
              "hover:shadow-[0_0_14px_rgba(0,200,255,0.35)]",
            )}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}
