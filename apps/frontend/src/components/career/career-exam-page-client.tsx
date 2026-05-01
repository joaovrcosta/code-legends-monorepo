"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CareerExamView } from "@/components/career/career-exam-view";
import type { GetCareerExamResponse } from "@/actions/career/get-exam";
import {
  CalendarBlank,
  CaretLeftIcon,
  Certificate,
  CheckCircle,
  Clock,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

function extractChallengeCount(content: unknown): number {
  const raw = (content as any)?.challenges;
  return Array.isArray(raw) ? raw.length : 0;
}

export function CareerExamPageClient({
  careerSlug,
  payload,
}: {
  careerSlug: string;
  payload: GetCareerExamResponse;
}) {
  const [started, setStarted] = useState(false);

  const { exam, career, module } = payload;
  const questionCount = useMemo(() => extractChallengeCount(exam.content), [exam.content]);

  if (started) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#0c0c0d]">
        <div className="mx-auto w-full max-w-[980px] px-4 py-8 lg:py-10">
          <CareerExamView
            careerSlug={careerSlug}
            onBackHref={`/learn/careers/${careerSlug}`}
            exam={exam as any}
            showHeader={false}
          />
        </div>
      </div>
    );
  }

  const eyebrow = module?.title ?? career?.title ?? "Exame de certificação";

  return (
    <div className="min-h-[100dvh] w-full bg-[#0c0c0d]">
      <div className="relative mx-auto w-full max-w-[980px] px-4 py-10 lg:py-14">
        <Link
          href={`/learn/careers/${careerSlug}`}
          className="group mb-6 inline-flex items-center gap-2 rounded-lg p-2 text-[#7e7e89] transition-colors hover:bg-white/5 hover:text-[#e0e0e8]"
        >
          <span className="inline-flex shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1">
            <CaretLeftIcon size={22} weight="bold" />
          </span>
          <span className="text-xs uppercase tracking-wider">Voltar</span>
        </Link>

        <Card className="p-0 text-white bg-gray-gradient rounded-[20px] border border-[#25252A]">
          <CardHeader className="px-6 py-6 border-b border-[#25252A] lg:px-8 lg:py-7">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e7e89]">
              {eyebrow}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white lg:text-[34px] lg:leading-tight">
              {exam.title}
            </h1>
            {exam.description ? (
              <p className="mt-3 max-w-[820px] text-sm leading-relaxed text-[#a5a5a6] lg:text-base">
                {exam.description}
              </p>
            ) : (
              <p className="mt-3 max-w-[820px] text-sm leading-relaxed text-[#a5a5a6] lg:text-base">
                Teste seu conhecimento nesta etapa. Você responderá{" "}
                <span className="font-semibold text-white">{questionCount}</span>{" "}
                {questionCount === 1 ? "questão" : "questões"}.
              </p>
            )}
          </CardHeader>

          <CardContent className="px-6 py-6 lg:px-8 lg:py-7">
            <div className="text-sm font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
              Eis o que esperar:
            </div>

            <ul className="mt-5 space-y-4">
              <li className="flex gap-4">
                <Clock className="mt-0.5 shrink-0 text-[#00C8FF]" size={22} />
                <p className="text-sm leading-relaxed text-[#c4c4cc]">
                  Participe desta parte de uma só vez. Recomendamos reservar um tempo
                  contínuo para não se sentir apressado.
                </p>
              </li>
              <li className="flex gap-4">
                <CalendarBlank className="mt-0.5 shrink-0 text-[#00C8FF]" size={22} />
                <p className="text-sm leading-relaxed text-[#c4c4cc]">
                  Você pode tentar novamente caso não atinja a nota mínima.
                </p>
              </li>
              <li className="flex gap-4">
                <CheckCircle className="mt-0.5 shrink-0 text-[#00C8FF]" size={22} />
                <p className="text-sm leading-relaxed text-[#c4c4cc]">
                  Pontuação{" "}
                  <span className="font-semibold text-white">{exam.passingScore}%</span> ou
                  mais para passar.
                </p>
              </li>
              <li className="flex gap-4">
                <SealCheck className="mt-0.5 shrink-0 text-[#00C8FF]" size={22} />
                <p className="text-sm leading-relaxed text-[#c4c4cc]">
                  Complete os exames exigidos no módulo para avançar na carreira.
                </p>
              </li>
              <li className="flex gap-4">
                <Certificate className="mt-0.5 shrink-0 text-[#00C8FF]" size={22} />
                <p className="text-sm leading-relaxed text-[#c4c4cc]">
                  Conclua a carreira para liberar o certificado.
                </p>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="secondary"
                asChild
                className="h-11 rounded-full border border-[#25252A] bg-transparent text-white hover:bg-white/5"
              >
                <Link href={`/learn/careers/${careerSlug}`}>Cancelar</Link>
              </Button>
              <Button
                onClick={() => setStarted(true)}
                className="h-11 rounded-full bg-blue-gradient-500 px-8 text-sm font-semibold text-black hover:shadow-[0_0_12px_#00C8FF] transition-all"
              >
                Iniciar exame
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
