"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Challenge } from "@/types/roadmap";
import { cn } from "@/lib/utils";
import {
  RaiQuestionBubble,
  pickRandomCheerMessage,
  pickRandomCheerVariant,
  type CheerVariant,
} from "@/components/classroom/challenge/challenge-rai-question-bubble";

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
  const [cheerMessage, setCheerMessage] = useState<string | null>(null);
  const [cheerVariant, setCheerVariant] = useState<CheerVariant>("happy1");
  const answerReported = useRef(false);

  const handleConfirm = useCallback(() => {
    if (submitted || selected === null) return;
    const correct = checkAnswer(challenge, selected);
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) {
      setCheerMessage(pickRandomCheerMessage());
      setCheerVariant(pickRandomCheerVariant());
    } else {
      setCheerMessage(null);
    }
    if (!answerReported.current) {
      answerReported.current = true;
      onAnswer?.(correct);
    }
  }, [submitted, selected, challenge, onAnswer]);

  const handleContinue = useCallback(() => {
    if (!submitted) return;
    setCheerMessage(null);
    setCheerVariant("happy1");
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
    <div className="relative my-6 mx-auto w-full max-w-[640px] rounded-[16px] overflow-hidden">
      <RaiQuestionBubble
        question={challenge.question}
        submitted={submitted}
        isCorrect={isCorrect}
        cheerMessage={cheerMessage}
        cheerVariant={cheerVariant}
      />

      {challenge.code ? (
        <div className="mx-5 mb-4 overflow-hidden rounded-[12px] border border-[#25252A] bg-[#0d0d0f]">
          <CodeBlockHighlighter
            code={challenge.code}
            language={challenge.language ?? "tsx"}
          />
        </div>
      ) : null}

      <div className="px-5 pb-4 flex flex-col gap-2">
        {options.map((option, i) => {
          const letter = String.fromCharCode(65 + i);
          const isThisCorrect = submitted && isOptionCorrect(challenge, option);
          const isThisWrong = submitted && selected === option && !isCorrect;
          const isSel = selected === option;

          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => !submitted && setSelected(option)}
              className={cn(
                "w-full text-left rounded-full border px-4 py-3 text-sm font-semibold transition-colors",
                isThisCorrect &&
                  "border-[#4ade80] bg-[#1a2e1a]/80 text-[#4ade80]",
                isThisWrong &&
                  "border-[#f87171] bg-[#3b1515]/80 text-[#f87171]",
                !submitted &&
                  isSel &&
                  "border-[#00b3e4]/70 bg-white/5 text-white",
                !submitted &&
                  !isSel &&
                  "border-[#3f3f47] bg-transparent text-white/90 hover:border-[#00b3e4]/50 hover:bg-white/5",
                submitted &&
                  !isThisCorrect &&
                  !isThisWrong &&
                  "border-[#2a2a31] text-[#6b6b76]",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold",
                  )}
                >
                  {letter}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{option}</span>
              </span>
            </button>
          );
        })}
      </div>

      {submitted && challenge.explanation?.trim() ? (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed text-[#a1a1aa]">
            {challenge.explanation}
          </p>
        </div>
      ) : null}

      <div className="flex w-full items-center justify-end px-5 pb-5">
        {!submitted ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected === null}
            className={cn(
              "font-wotfard mt-4 flex h-[38px] w-full items-center justify-center gap-2 rounded-full bg-[#00b3e4] px-5 py-2 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 lg:mt-4 lg:w-[115px]",
            )}
          >
            Verificar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className={cn(
              "font-wotfard flex h-[38px] w-full items-center justify-center gap-2 rounded-full bg-[#00b3e4] px-5 py-2 text-base font-semibold text-black transition-opacity hover:opacity-90 lg:w-auto",
            )}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}
