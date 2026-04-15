"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { completeOnboarding, updateOnboarding } from "@/actions/user";
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar";
import {
  ONBOARDING_STEP,
  onboardingProgressPercent,
} from "@/components/onboarding/onboarding-constants";
import { listCategories } from "@/actions/course/list-categories";
import { listCoursesByCategory } from "@/actions/course/list-courses-by-category";
import { Category } from "@/types/categories";
import type { CourseWithCount } from "@/types/user-course.ts";
import codeLegendsLogo from "../../../../../public/loading-logo.svg";

const CATEGORY_REVEAL_STAGGER_MS = 200;
const CATEGORY_REVEAL_INITIAL_DELAY_MS = 100;

function getCareersPageTitle(userName?: string | null) {
  const safeName = userName?.trim();
  if (!safeName || safeName.toLowerCase() === "você") {
    return "Por qual área você quer se especializar?";
  }

  const firstName = safeName.split(/\s+/).filter(Boolean)[0] ?? safeName;
  return `${firstName}, por qual área você quer se especializar?`;
}

const TITLE_TYPING_MS = 36;
const COURSES_MIN_TYPING_MS = 1200;
const BOT_RESPONSE_INITIAL_DELAY_MS = 800;
const BOT_MESSAGE_STAGGER_MS = 260;

const CAREER_MOTIVATIONAL_TITLES: Record<string, string[]> = {
  frontend: [
    "Crie experiências incríveis no Front-end.",
    "Encante a cada clique.",
    "Domine o Front-end.",
  ],
  "front-end": [
    "Crie experiências incríveis no Front-end.",
    "Encante a cada clique.",
    "Domine o Front-end.",
  ],
  backend: [
    "Construa a base do produto.",
    "Escale com performance.",
    "Crie APIs de impacto.",
  ],
  "back-end": [
    "Construa a base do produto.",
    "Escale com performance.",
    "Crie APIs de impacto.",
  ],
  designer: [
    "Design com propósito.",
    "Crie boas experiências.",
    "Visual que gera confiança.",
  ],
  ingles: [
    "Inglês abre portas.",
    "Destrave sua fluência.",
    "Prepare-se para o global.",
  ],
  "inglês": [
    "Inglês abre portas.",
    "Destrave sua fluência.",
    "Prepare-se para o global.",
  ],
  empreendedorismo: [
    "Transforme ideias em ação.",
    "Execute com visão.",
    "Tire seu projeto do papel.",
  ],
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function pickRandom<T>(items: T[], avoid?: T) {
  if (items.length <= 1) return items[0];
  const filtered = avoid === undefined ? items : items.filter((x) => x !== avoid);
  const pool = filtered.length > 0 ? filtered : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function CareersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, update } = useSession();
  const chatAnchorRef = useRef<HTMLDivElement>(null);

  const userAvatarSrc =
    (session?.user as
      | { image?: string | null; avatar?: string | null }
      | undefined)?.image ??
    (session?.user as
      | { image?: string | null; avatar?: string | null }
      | undefined)?.avatar ??
    null;

  const userDisplayName =
    (session?.user as { name?: string | null } | undefined)?.name?.trim() ||
    "Você";

  const baseTitle = getCareersPageTitle(userDisplayName);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseWithCount[]>([]);
  const [coursesLoadState, setCoursesLoadState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [coursesError, setCoursesError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [barFill, setBarFill] = useState(() =>
    onboardingProgressPercent(ONBOARDING_STEP.career),
  );
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(0);
  const [titleTarget, setTitleTarget] = useState(() => baseTitle);
  const [typedTitle, setTypedTitle] = useState("");
  const [titleTypingDone, setTitleTypingDone] = useState(false);
  const [botMessageVisible, setBotMessageVisible] = useState(false);
  const [botRevealedCount, setBotRevealedCount] = useState(0);

  const slugFromUrl = searchParams.get("categorySlug");

  useEffect(() => {
    if (slugFromUrl) {
      setSelectedCareer(slugFromUrl);
    }
  }, [slugFromUrl]);

  useEffect(() => {
    setTypedTitle("");
    setTitleTypingDone(false);

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedTitle(titleTarget.slice(0, i));
      if (i >= titleTarget.length) {
        window.clearInterval(id);
        setTitleTypingDone(true);
      }
    }, TITLE_TYPING_MS);

    return () => window.clearInterval(id);
  }, [titleTarget]);

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

  useEffect(() => {
    if (!selectedCareer) {
      setCourses([]);
      setCoursesError("");
      setCoursesLoadState("idle");
      setSelectedCourse(null);
      setBarFill(onboardingProgressPercent(ONBOARDING_STEP.career));
      setBotMessageVisible(false);
      setBotRevealedCount(0);
      return;
    }

    let cancelled = false;
    setCoursesLoadState("loading");
    setCoursesError("");
    setCourses([]);
    setSelectedCourse(null);
    setBotMessageVisible(false);
    setBotRevealedCount(0);

    const botDelayId = window.setTimeout(() => {
      if (!cancelled) setBotMessageVisible(true);
    }, BOT_RESPONSE_INITIAL_DELAY_MS);

    (async () => {
      const startedAt = Date.now();
      try {
        await updateOnboarding({ career: selectedCareer });
        const data = await listCoursesByCategory(selectedCareer);
        const elapsed = Date.now() - startedAt;
        if (elapsed < COURSES_MIN_TYPING_MS) {
          await sleep(COURSES_MIN_TYPING_MS - elapsed);
        }
        if (!cancelled) {
          setCourses(data.courses);
          setCoursesLoadState("done");
          setBarFill(onboardingProgressPercent(ONBOARDING_STEP.course));
        }
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        const elapsed = Date.now() - startedAt;
        if (elapsed < COURSES_MIN_TYPING_MS) {
          await sleep(COURSES_MIN_TYPING_MS - elapsed);
        }
        if (!cancelled) {
          setCoursesLoadState("error");
          setCoursesError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os cursos.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(botDelayId);
    };
  }, [selectedCareer]);

  useEffect(() => {
    if (!selectedCareer || !botMessageVisible) return;
    if (coursesLoadState !== "done") return;

    // 1 = primeira mensagem textual, depois 1 por curso
    let cancelled = false;
    setBotRevealedCount(1);

    if (courses.length === 0) {
      return;
    }

    const total = 1 + courses.length;
    let current = 1;
    const id = window.setInterval(() => {
      if (cancelled) return;
      current += 1;
      setBotRevealedCount(current);
      if (current >= total) {
        window.clearInterval(id);
      }
    }, BOT_MESSAGE_STAGGER_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [selectedCareer, botMessageVisible, coursesLoadState, courses.length]);

  const scrollChatToLatest = useCallback(() => {
    const el = chatAnchorRef.current;
    if (!el) return;
    // 2 RAFs ajuda quando o DOM ainda está “entrando” com animação
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }, []);

  useEffect(() => {
    if (!selectedCareer) return;
    // Quando o usuário “envia” (mensagem do aluno), já desce pro chat
    scrollChatToLatest();
  }, [selectedCareer, scrollChatToLatest]);

  useEffect(() => {
    if (!selectedCareer || !botMessageVisible) return;
    // Quando a resposta da Code Legends aparece (digitando...), desce até ela
    scrollChatToLatest();
  }, [selectedCareer, botMessageVisible, scrollChatToLatest]);

  useEffect(() => {
    if (!selectedCareer || !botMessageVisible) return;
    if (coursesLoadState !== "done" && coursesLoadState !== "error") return;
    // Quando termina (cursos ou erro), garante que a mensagem final esteja visível
    scrollChatToLatest();
  }, [
    selectedCareer,
    botMessageVisible,
    coursesLoadState,
    scrollChatToLatest,
  ]);

  const selectedCategoryName =
    categories.find((c) => c.slug === selectedCareer)?.name ?? "";

  useEffect(() => {
    if (!selectedCareer) {
      setTitleTarget(baseTitle);
      return;
    }

    const slugKey = selectedCareer.toLowerCase();
    const options = CAREER_MOTIVATIONAL_TITLES[slugKey];

    if (options && options.length > 0) {
      setTitleTarget((prev) => pickRandom(options, prev));
      return;
    }

    // Fallback: usa o nome da categoria para manter contextual
    const name = categories.find((c) => c.slug === selectedCareer)?.name?.trim();
    setTitleTarget(
      name
        ? `Ótima escolha: ${name}. Vamos dar o próximo passo juntos?`
        : "Ótima escolha. Vamos dar o próximo passo juntos?",
    );
  }, [selectedCareer, categories, baseTitle]);

  const syncCareerToUrl = useCallback(
    (slug: string) => {
      router.replace(
        `/onboarding/pick-a-goal/careers?categorySlug=${encodeURIComponent(slug)}`,
        { scroll: false },
      );
    },
    [router],
  );

  const handleCareerClick = (slug: string) => {
    if (isLoading) return;
    setError("");
    setSelectedCareer(slug);
    syncCareerToUrl(slug);
  };

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

      while (
        !onboardingCompleted &&
        verificationAttempts < maxVerificationAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const status = await getOnboardingStatus();
        onboardingCompleted = status.isCompleted;
        verificationAttempts++;
      }

      await update();
      await new Promise((resolve) => setTimeout(resolve, 200));
      window.location.href = "/";
    } catch (e) {
      console.error("Erro ao completar onboarding:", e);
      setError(
        e instanceof Error
          ? e.message
          : "Erro ao completar onboarding. Tente novamente.",
      );
      setIsLoading(false);
    }
  };

  const handleFinalizeCourse = async () => {
    if (!selectedCourse) return;

    try {
      setIsLoading(true);
      setError("");
      const course = courses.find((c) => c.slug === selectedCourse);
      if (course) {
        const { enrollInCourse } = await import("@/actions/course/enroll");
        await enrollInCourse(course.id);
        const { startCourse } = await import("@/actions/course/start");
        await startCourse(course.id);
      }
      await finishOnboardingAndGoHome();
    } catch (e) {
      console.error("Erro ao completar onboarding:", e);
      setError(
        e instanceof Error
          ? e.message
          : "Erro ao completar onboarding. Tente novamente.",
      );
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (isLoading || categories.length === 0) return;
    const fallbackSlug = selectedCareer || categories[0]?.slug;
    if (!fallbackSlug) return;
    handleCareerClick(fallbackSlug);
  };

  const inCourseStep = selectedCareer !== null;
  const topStep = inCourseStep
    ? ONBOARDING_STEP.course
    : ONBOARDING_STEP.career;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#0D0D12] max-w-3xl w-full mx-auto">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-14 lg:pb-14 lg:pt-10">
        <OnboardingTopBar
          currentStep={topStep}
          progressFillPercent={barFill}
        />

        <header className="mt-6 flex items-center justify-center gap-4 sm:mt-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
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
              className="flex flex-wrap items-center gap-1 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl"
              aria-label={titleTarget}
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

        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <div
            className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pb-2"
            role="region"
            aria-label="Áreas de especialização e trilhas"
          >
            <div
              className="flex gap-3"
              role="listbox"
              aria-label="Áreas de especialização"
            >
              <div className="flex h-10 w-10 shrink-0 items-start justify-center overflow-hidden rounded-xl bg-[#1b1b26] pt-0.5">
                <Image
                  src={codeLegendsLogo}
                  alt=""
                  width={40}
                  height={40}
                  className="h-9 w-9"
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-xs font-medium text-white/50 mb-3">
                  Code Legends
                </p>
                <div className="flex flex-col gap-3">
                  {categories.length === 0 && !error ? (
                    <div
                      className="py-6 flex items-center justify-center"
                      role="status"
                      aria-label="Code Legends está digitando"
                    >
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.2s]" />
                        <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.1s]" />
                        <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce" />
                      </span>
                    </div>
                  ) : null}

                  {categories.slice(0, visibleCategoryCount).map((category) => {
                    const isSelected = selectedCareer === category.slug;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCareerClick(category.slug)}
                        disabled={isLoading}
                        className={[
                          "flex h-[56px] w-fit animate-in fade-in-0 slide-in-from-bottom-2 items-center justify-center gap-2 self-start rounded-[24px] px-4 py-3.5 text-left text-base duration-300 fill-mode-both motion-reduce:animate-none",
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
            </div>

            {selectedCareer ? (
              <div ref={chatAnchorRef} className="flex flex-col gap-8">
                <div key={selectedCareer} className="flex flex-col items-end">
                  <div className="flex items-end justify-end gap-3 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300 fill-mode-both">
                    <div>
                      <div className="flex items-center justify-end">
                        <p className="mb-1.5 text-xs font-medium text-white/50">
                          {userDisplayName}
                        </p>
                      </div>
                      <div
                        className="max-w-[min(100%,22rem)] rounded-full h-[56px] flex items-center justify-center bg-[#1b1b26] px-4 py-3"
                        role="status"
                      >
                        <p className="text-sm font-semibold leading-snug text-white">
                          Quero me especializar em {selectedCategoryName}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1b1b26]">
                      {userAvatarSrc ? (
                        <Image
                          src={userAvatarSrc}
                          alt="Seu avatar"
                          width={40}
                          height={40}
                          className="h-9 w-9 object-cover"
                        />
                      ) : (
                        <span
                          className="text-sm font-semibold text-white/80"
                          aria-hidden
                        >
                          Você
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {botMessageVisible ? (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-start justify-center overflow-hidden rounded-xl bg-[#1b1b26] pt-0.5">
                      <Image
                        src={codeLegendsLogo}
                        alt=""
                        width={40}
                        height={40}
                        className="h-9 w-9"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-3 text-xs font-medium text-white/50">
                        Code Legends
                      </p>

                      {/* Mensagem 1: texto */}
                      {coursesLoadState === "done" && botRevealedCount >= 1 ? (
                        <div className="w-fit max-w-[min(100%,28rem)] rounded-[24px] bg-[#1b1b26] px-4 py-4 sm:px-5 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300 fill-mode-both">
                          <p className="text-sm leading-relaxed text-white/90">
                            Separamos estas trilhas em{" "}
                            <span className="font-semibold text-[#00C8FF]">
                              {selectedCategoryName}
                            </span>{" "}
                            para você começar. Escolha uma:
                          </p>
                        </div>
                      ) : null}

                      {/* Mensagens seguintes: 1 curso por mensagem */}
                      {coursesLoadState === "done" && courses.length > 0 ? (
                        <div className="mt-3 flex flex-col gap-3">
                          {courses
                            .slice(0, Math.max(0, botRevealedCount - 1))
                            .map((course) => {
                              const isSelected = selectedCourse === course.slug;
                              return (
                                <div
                                  key={course.id}
                                  className="w-fit max-w-[min(100%,28rem)] rounded-[24px] bg-[#1b1b26] px-3 py-3 sm:px-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300 fill-mode-both"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCourse(course.slug)}
                                    disabled={isLoading}
                                    className={[
                                      "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
                                      isSelected
                                        ? "bg-blue-gradient-500 border-none"
                                        : "border-[#2a2a31] bg-[#121218] hover:border-[#3d3d46] hover:bg-[#1a1a22]",
                                      isLoading ? "pointer-events-none opacity-50" : "",
                                    ].join(" ")}
                                  >
                                    {course.icon ? (
                                      <span className="relative block h-12 w-12 shrink-0 overflow-hidden">
                                        <Image
                                          src={course.icon}
                                          alt=""
                                          fill
                                          className="object-cover"
                                          sizes="48px"
                                        />
                                      </span>
                                    ) : (
                                      <span
                                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25252a] text-lg text-white/80"
                                        aria-hidden
                                      >
                                        📘
                                      </span>
                                    )}
                                    <span
                                      className={[
                                        "text-sm leading-snug",
                                        isSelected
                                          ? "font-semibold text-white"
                                          : "font-medium text-white/90",
                                      ].join(" ")}
                                    >
                                      {course.title}
                                    </span>
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      ) : null}

                      {coursesLoadState === "done" &&
                        botRevealedCount >= 1 &&
                        courses.length === 0 ? (
                        <div className="mt-3 w-fit max-w-[min(100%,28rem)] rounded-[24px] bg-[#1b1b26] px-4 py-4 sm:px-5 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300 fill-mode-both">
                          <p className="text-sm text-white/60">
                            Nenhuma trilha disponível nesta área no momento.
                          </p>
                        </div>
                      ) : null}

                      {coursesLoadState === "loading" ||
                        (coursesLoadState === "done" &&
                          courses.length > 0 &&
                          botRevealedCount < 1 + courses.length) ? (
                        <div className="mt-3 w-fit rounded-[24px] bg-[#1b1b26] px-4 py-3">
                          <div
                            className="flex items-center gap-2 text-sm text-white/60"
                            role="status"
                            aria-label="Code Legends está digitando"
                          >
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.2s]" />
                              <span className="h-2 w-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.1s]" />
                              <span className="h-2 w-2 rounded-full bg-white/40 animate-bounce" />
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {coursesLoadState === "error" ? (
                        <div className="w-fit max-w-[min(100%,28rem)] rounded-[24px] bg-[#1b1b26] px-4 py-4 sm:px-5">
                          <p className="text-sm text-red-400">{coursesError}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <footer className="mt-auto flex flex-col items-center justify-center space-y-4 pt-10">
          {inCourseStep ? (
            <>
              <button
                type="button"
                onClick={handleFinalizeCourse}
                disabled={
                  !selectedCourse ||
                  isLoading ||
                  coursesLoadState !== "done"
                }
                className="mx-auto w-full max-w-[280px] rounded-full bg-[#ececee] py-4 text-center text-base font-semibold text-[#0D0D12] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
            </>
          ) : (
            <button
              type="button"
              disabled={isLoading || categories.length === 0}
              onClick={handleSkip}
              className="w-full text-center text-sm text-white/45 transition-colors hover:text-white/75 disabled:opacity-50"
            >
              Pular etapa
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center bg-[#0D0D12] px-6 py-20">
          <p className="text-lg text-white/70">Carregando…</p>
        </div>
      }
    >
      <CareersPageContent />
    </Suspense>
  );
}
