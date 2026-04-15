"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { completeOnboarding } from "@/actions/user";
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar";
import { ONBOARDING_STEP } from "@/components/onboarding/onboarding-constants";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { listCoursesByCategory } from "@/actions/course/list-courses-by-category";
import { CourseWithCount } from "@/types/user-course.ts";

function ChooseCourseContent() {
  const [courses, setCourses] = useState<CourseWithCount[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const categorySlug = searchParams.get("categorySlug");

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

  const finishOnboardingAndGoToLearn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await completeOnboarding();

      // Verificar diretamente na API se o onboarding foi completado
      // Isso garante que temos confirmação antes de redirecionar
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

      // Forçar atualização imediata da sessão para refletir o onboarding completo
      // Isso garante que o middleware detecte a mudança imediatamente
      await update();

      // Aguardar um pouco mais para garantir que a sessão seja propagada no servidor
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Aguardar que o curso ativo esteja disponível na API
      const { getActiveCourse } = await import(
        "@/actions/user/get-active-course"
      );
      let activeCourse = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!activeCourse && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        activeCourse = await getActiveCourse();
        attempts++;
      }

      // Usar window.location.href para fazer hard redirect e forçar o middleware
      // a buscar a sessão atualizada do servidor
      window.location.href = "/learn";
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

      await finishOnboardingAndGoToLearn();
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

  const areaLabel =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, " ");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#0D0D12] max-w-3xl w-full mx-auto">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-14 lg:pb-14 lg:pt-10">
        <OnboardingTopBar currentStep={ONBOARDING_STEP.course} />

        <header className="mt-6 flex gap-4 sm:mt-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B8E62E] shadow-[0_0_20px_rgba(184,230,46,0.25)]">
            <BookOpen className="h-6 w-6 text-[#0D0D12]" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
              Escolha sua primeira trilha em{" "}
              <span className="text-[#B8E62E]">{areaLabel}</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
              Essa será sua primeira trilha de aprendizado na plataforma.
            </p>
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
            onClick={finishOnboardingAndGoToLearn}
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
