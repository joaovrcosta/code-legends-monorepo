"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOnboarding } from "@/actions/user";
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar";
import {
  ONBOARDING_BAR_TRANSITION_MS,
  ONBOARDING_STEP,
  onboardingProgressPercent,
} from "@/components/onboarding/onboarding-constants";
import { listCategories } from "@/actions/course/list-categories";
import { Category } from "@/types/categories";
import codeLegendsLogo from '../../../../../public/loading-logo.svg'
import Image from "next/image";

const CATEGORY_REVEAL_STAGGER_MS = 200;
const CATEGORY_REVEAL_INITIAL_DELAY_MS = 100;

const CAREERS_PAGE_TITLE = "Por qual área você quer se especializar?";
const TITLE_TYPING_MS = 36;

export default function CareersPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [barFill, setBarFill] = useState(() =>
    onboardingProgressPercent(ONBOARDING_STEP.career),
  );
  /** Quantas categorias já foram reveladas (uma por vez, estilo chat). */
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [titleTypingDone, setTitleTypingDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedTitle(CAREERS_PAGE_TITLE.slice(0, i));
      if (i >= CAREERS_PAGE_TITLE.length) {
        window.clearInterval(id);
        setTitleTypingDone(true);
      }
    }, TITLE_TYPING_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await listCategories();
        setCategories(data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Não foi possível carregar as categorias.");
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      setVisibleCategoryCount(0);
      return;
    }

    setVisibleCategoryCount(0);
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < categories.length; i++) {
      timeoutIds.push(
        setTimeout(() => {
          setVisibleCategoryCount(i + 1);
        }, CATEGORY_REVEAL_INITIAL_DELAY_MS + i * CATEGORY_REVEAL_STAGGER_MS),
      );
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [categories]);

  const pushChooseCourse = (slug: string) => {
    router.push(
      `/onboarding/pick-a-goal/careers/choose-course?categorySlug=${slug}`,
    );
  };

  const handleContinue = async () => {
    if (!selectedCareer) return;

    const prevFill = barFill;
    setBarFill(onboardingProgressPercent(ONBOARDING_STEP.course));

    try {
      setIsLoading(true);
      setError("");
      await updateOnboarding({ career: selectedCareer });
      await new Promise((r) => setTimeout(r, ONBOARDING_BAR_TRANSITION_MS));
      pushChooseCourse(selectedCareer);
    } catch (err) {
      console.error("Erro ao salvar carreira:", err);
      setBarFill(prevFill);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar carreira. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (isLoading || categories.length === 0) return;
    const fallbackSlug = selectedCareer || categories[0]?.slug;
    if (!fallbackSlug) return;
    setBarFill(onboardingProgressPercent(ONBOARDING_STEP.course));
    window.setTimeout(
      () => pushChooseCourse(fallbackSlug),
      ONBOARDING_BAR_TRANSITION_MS,
    );
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#0D0D12] max-w-3xl w-full mx-auto">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-14 lg:pb-14 lg:pt-10">
        <OnboardingTopBar
          currentStep={ONBOARDING_STEP.career}
          progressFillPercent={barFill}
        />

        <header className="mt-6 flex items-center justify-center gap-4 sm:mt-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            <Image src={codeLegendsLogo} alt="Code Legends" className="h-12 w-12" />
          </div>
          <div className="flex min-h-12 min-w-0 flex-1 items-center">
            <h1
              className="flex flex-wrap items-center gap-1 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl"
              aria-label={CAREERS_PAGE_TITLE}
            >
              <span className="min-w-0">{typedTitle}</span>
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

        <div className="mt-8 flex min-h-0 flex-1 flex-col items-center">
          <div
            className="flex w-full flex-col gap-3 overflow-y-auto pb-2"
            role="listbox"
            aria-label="Áreas de especialização"
          >
            {categories.length === 0 && !error ? (
              <p className="py-6 text-center text-sm text-white/45">
                Carregando trilhas…
              </p>
            ) : null}

            {categories.slice(0, visibleCategoryCount).map((category) => {
              const isSelected = selectedCareer === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCareer(category.slug)}
                  disabled={isLoading}
                  className={[
                    "flex h-[56px] w-fit animate-in fade-in-0 slide-in-from-bottom-2 items-center justify-center gap-2 self-start rounded-full px-4 py-3.5 text-left text-base duration-300 fill-mode-both motion-reduce:animate-none",
                    isSelected
                      ? "border-[#00C8FF] bg-blue-gradient-500 shadow-[0_0_20px_rgba(0,200,255,0.12)]"
                      : "border-[#32323a] bg-[#1b1b26] hover:border-[#3d3d46] hover:bg-[#2a2a32]",
                    isLoading ? "pointer-events-none opacity-50" : "",
                  ].join(" ")}
                >

                  <span
                    className={[
                      "min-w-0 text-sm leading-snug",
                      isSelected
                        ? "font-semibold text-white"
                        : "font-medium text-white/90",
                    ].join(" ")}
                  >
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="mt-auto space-y-4 pt-10 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedCareer || isLoading}
            className="mx-auto w-full lg:max-w-[280px] rounded-full bg-[#ececee] py-4 text-center text-base font-semibold text-[#0D0D12] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Salvando…" : "Continuar"}
          </button>
          <button
            type="button"
            disabled={isLoading || categories.length === 0}
            onClick={handleSkip}
            className="w-full text-center text-sm text-white/45 transition-colors hover:text-white/75 disabled:opacity-50"
          >
            Pular etapa
          </button>
        </footer>
      </div>
    </div>
  );
}
