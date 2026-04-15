"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { completeOnboarding } from "@/actions/user";
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar";
import { ONBOARDING_STEP } from "@/components/onboarding/onboarding-constants";
import Image from "next/image";
import { listCoursesByCategory } from "@/actions/course/list-courses-by-category";
import { CourseWithCount } from "@/types/user-course.ts";
import codeLegendsLogo from '../../../../../../public/loading-logo.svg'

const CHOOSE_COURSE_TITLE_PREFIX = "Escolha sua primeira trilha em ";
const TITLE_TYPING_MS = 36;

function ChooseCourseContent() {
  const [courses, setCourses] = useState<CourseWithCount[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const categorySlug = searchParams.get("categorySlug");

  const areaLabel = useMemo(() => {
    if (!categorySlug) return "";
    return (
      categorySlug.charAt(0).toUpperCase() +
      categorySlug.slice(1).replace(/-/g, " ")
    );
  }, [categorySlug]);

  const [typedTitle, setTypedTitle] = useState("");
  const [titleTypingDone, setTitleTypingDone] = useState(false);

  useEffect(() => {
    if (!categorySlug || !areaLabel) return;

    const fullTitle = `${CHOOSE_COURSE_TITLE_PREFIX}${areaLabel}`;
    setTypedTitle("");
    setTitleTypingDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedTitle(fullTitle.slice(0, i));
      if (i >= fullTitle.length) {
        window.clearInterval(id);
        setTitleTypingDone(true);
      }
    }, TITLE_TYPING_MS);
    return () => window.clearInterval(id);
  }, [categorySlug, areaLabel]);

  useEffect(() => {
    async function fetchCourses() {
      if (!categorySlug) {
        setError("Categoria não encontrada.");
        return;
      }

      try {
        const data = await listCoursesByCategory(categorySlug);
        setCourses(data.courses);
      } catch (err) {
        console.error("Erro ao buscar cursos:", err);
        setError("Não foi possível carregar os cursos.");
      }
    }
    fetchCourses();
  }, [categorySlug]);

  const finishOnboardingAndGoHome = async () => {
    try {
      setIsLoading(true);
      setError("");
      await completeOnboarding();

      const { getOnboardingStatus } = await import(
        "@/actions/user/get-onboarding-status"
      );
      let onboardingCompleted = false;
      let verificationAttempts = 0;
      const maxVerificationAttempts = 5;

      while (!onboardingCompleted && verificationAttempts < maxVerificationAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const status = await getOnboardingStatus();
        onboardingCompleted = status.isCompleted;
        verificationAttempts++;
      }

      await update();

      await new Promise((resolve) => setTimeout(resolve, 200));

      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao completar onboarding. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedCourse) return;

    try {
      setIsLoading(true);
      setError("");
      // Encontrar o curso selecionado para obter o ID
      const course = courses.find((c) => c.slug === selectedCourse);
      if (course) {
        // Inscrever o usuário no curso
        const { enrollInCourse } = await import("@/actions/course/enroll");
        await enrollInCourse(course.id);

        // Iniciar o curso selecionado
        const { startCourse } = await import("@/actions/course/start");
        await startCourse(course.id);
      }

      await finishOnboardingAndGoHome();
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao completar onboarding. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  if (!categorySlug) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#0D0D12] px-6 py-16">
        <p className="text-center text-lg text-white">Categoria não encontrada.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 text-sm font-medium text-[#B8E62E] hover:underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  const chooseCourseFullTitle = `${CHOOSE_COURSE_TITLE_PREFIX}${areaLabel}`;
  const prefixLen = CHOOSE_COURSE_TITLE_PREFIX.length;
  const typedLen = typedTitle.length;
  const whitePart =
    typedLen <= prefixLen ? typedTitle : typedTitle.slice(0, prefixLen);
  const cyanPart =
    typedLen > prefixLen ? typedTitle.slice(prefixLen) : "";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#0D0D12] max-w-3xl w-full mx-auto">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-14 lg:pb-14 lg:pt-10">
        <OnboardingTopBar currentStep={ONBOARDING_STEP.course} />

        <header className="mt-6 flex items-center justify-center gap-4 sm:mt-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Image
              src={codeLegendsLogo}
              alt="Code Legends"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          <div className="flex min-h-12 min-w-0 flex-1 items-center">
            <h1
              className="flex flex-wrap items-center gap-1 text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
              aria-label={chooseCourseFullTitle}
            >
              <span className="min-w-0">
                <span className="text-white">{whitePart}</span>
                {cyanPart ? (
                  <span className="text-[#00C8FF]">{cyanPart}</span>
                ) : null}
              </span>
              {!titleTypingDone ? (
                <span
                  className="inline-block h-[1em] w-0.5 shrink-0 self-center bg-[#00C8FF] animate-pulse"
                  aria-hidden
                />
              ) : null}
            </h1>
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid flex-1 grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:gap-5">
          {courses.length === 0 && !error && (
            <div className="col-span-full py-12 text-center text-sm text-white/50">
              Carregando cursos…
            </div>
          )}
          {courses.map((course) => {
            const isSelected = selectedCourse === course.slug;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourse(course.slug)}
                disabled={isLoading}
                className={[
                  "flex min-h-[140px] flex-col items-center justify-center gap-4 rounded-2xl border px-5 py-6 text-center transition-all duration-200 sm:min-h-[160px]",
                  isSelected
                    ? "border-transparent bg-gradient-to-br from-[#2a1040] via-[#4a1f6e] to-[#8234E9] shadow-[0_12px_40px_rgba(130,52,233,0.25)] ring-1 ring-white/10"
                    : "border-[#2a2a31] bg-[#16161c] hover:border-[#3d3d46] hover:bg-[#1a1a22]",
                  isLoading ? "pointer-events-none opacity-50" : "",
                ].join(" ")}
              >
                {course.icon ? (
                  <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#25252a]">
                    <Image
                      src={course.icon}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </span>
                ) : (
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#25252a] text-xl text-white/80"
                    aria-hidden
                  >
                    📘
                  </span>
                )}
                <span
                  className={[
                    "text-sm leading-snug sm:text-[15px]",
                    isSelected
                      ? "font-semibold text-white"
                      : "font-medium text-white/90",
                  ].join(" ")}
                >
                  {course.title}
                </span>
              </button>
            );
          })}
        </div>

        <footer className="mt-auto space-y-4 pt-10 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedCourse || isLoading}
            className="w-full rounded-full bg-[#ececee] max-w-[280px] mx-auto py-4 text-center text-base font-semibold text-[#0D0D12] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Criando sua trilha…" : "Finalizar"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={finishOnboardingAndGoHome}
            className="w-full text-center text-sm text-white/45 transition-colors hover:text-white/75 disabled:opacity-50"
          >
            Pular etapa
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function ChooseCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col items-center justify-center bg-[#0D0D12] px-6 py-20">
          <p className="text-lg text-white/70">Carregando…</p>
        </div>
      }
    >
      <ChooseCourseContent />
    </Suspense>
  );
}
