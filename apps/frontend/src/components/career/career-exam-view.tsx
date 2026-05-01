"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CareerExam, SubmitCareerExamAttemptResponse } from "@/types/career";
import { submitCareerExamAttempt } from "@/actions/career";
import { ChallengeBlock } from "@/components/classroom/challenge/ChallengeBlock";
import {
  ExamMcqChallenge,
  isCareerExamMultipleChoice,
} from "@/components/career/exam-mcq-challenge";
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar";
import type { Challenge } from "@/types/roadmap";

const DEFAULT_PASSING_SCORE = 70;

function extractChallenges(exam: CareerExam & { content?: any }): Challenge[] {
  const content = (exam as any)?.content;
  const raw = content?.challenges;
  if (!Array.isArray(raw)) return [];
  return raw as Challenge[];
}

export function CareerExamView({
  careerSlug,
  exam,
  onBackHref,
  onSubmitted,
  showHeader = true,
}: {
  careerSlug: string;
  exam: CareerExam & { content?: any };
  onBackHref: string;
  onSubmitted?: (r: SubmitCareerExamAttemptResponse) => void;
  showHeader?: boolean;
}) {
  const challenges = useMemo(() => extractChallenges(exam), [exam]);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = challenges.length;
  const correctCount = answers.filter(Boolean).length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passingScore =
    typeof (exam as any).passingScore === "number"
      ? (exam as any).passingScore
      : DEFAULT_PASSING_SCORE;
  const passed = score >= passingScore;

  const currentChallenge =
    challenges.length > 0 ? challenges[currentIndex] : undefined;

  const handleAnswer = (correct: boolean) => {
    setAnswers((prev) => [...prev, correct]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= challenges.length) {
      setQuizFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await submitCareerExamAttempt({
        careerIdentifier: careerSlug,
        examId: exam.id,
        score,
        answers: { answers },
      });
      onSubmitted?.(result);
      if (result.passed) {
        alert("Exame aprovado!");
      } else {
        alert("Exame enviado. Você não atingiu a nota mínima.");
      }
      window.location.href = onBackHref;
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : (e as any)?.message
            ? String((e as any).message)
            : (e as any)?.digest
              ? "Erro ao enviar (Server Action). Verifique o console do servidor."
              : "Erro ao enviar";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0">
      {showHeader ? (
        <div className="rounded-2xl border border-[#25252A] bg-gray-gradient px-6 py-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Certification exam
            </div>
            <h1 className="text-2xl font-semibold text-white">{exam.title}</h1>
          </div>
        </div>
      ) : null}

      <div className={showHeader ? "mt-6" : "mt-0"}>
        {challenges.length === 0 ? (
          <div className="rounded-2xl border border-[#25252A] bg-[#0D0D12] p-6 text-center text-white/60">
            Nenhuma questão cadastrada para este exame.
          </div>
        ) : quizFinished ? (
          <div className="rounded-2xl border border-[#25252A] bg-[#0D0D12] p-6 text-center">
            <div className="text-lg font-semibold text-white">
              {passed ? "Aprovado!" : "Reprovado"}
            </div>
            <div className="mt-2 text-sm text-white/60">
              Você acertou {correctCount} de {total} ({score}%).
            </div>
            {!passed ? (
              <div className="mt-1 text-xs text-white/45">
                Nota mínima: {passingScore}%.
              </div>
            ) : null}
            <div className="mt-5">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full bg-[#00b3e4] text-black hover:opacity-90"
              >
                {isSubmitting ? "Enviando..." : "Enviar resultado"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <OnboardingTopBar
              currentStep={currentIndex + 1}
              totalSteps={total}
              backHref={onBackHref}
            />
            <p className="text-center text-xs font-medium uppercase tracking-wider text-[#7e7e89]">
              Questão {currentIndex + 1} de {total}
            </p>
            {currentChallenge &&
            isCareerExamMultipleChoice(currentChallenge) ? (
              <div key={currentIndex} className="min-h-[200px]">
                <ExamMcqChallenge
                  challenge={currentChallenge}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                />
              </div>
            ) : currentChallenge ? (
              <div className="rounded-2xl border border-[#25252A] bg-[#0D0D12] p-4">
                <ChallengeBlock
                  key={currentIndex}
                  challenge={currentChallenge}
                  index={currentIndex}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  allowRetry={false}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

