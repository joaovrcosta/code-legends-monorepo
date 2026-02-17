"use client";

// import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUserEnrolledList } from "@/actions/progress/get-user-enrolled-list";
import { useEnrolledCoursesStore } from "@/stores/enrolled-courses-store";
import {
  ArrowClockwise,
  Certificate,
  CheckCircle,
  PlayIcon,
  PlusIcon,
  PuzzlePiece,
  ThumbsUpIcon,
  ThumbsDown,
  Trophy,
  VideoCameraIcon,
  Check,
} from "@phosphor-icons/react/dist/ssr";
import { ArrowLeft, ChartNoAxesColumnIncreasingIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { CourseDetail } from "@/types/course-types";
import type { UserCourseProgressResponse } from "@/types/user-course.ts";

interface CourseBannerProps {
  course: CourseDetail;
  userProgress?: UserCourseProgressResponse | null;
}

const getLevelLabel = (level: string): string => {
  const levelMap: Record<string, string> = {
    beginner: "INICIANTE",
    intermediate: "INTERMEDIARIO",
    advanced: "AVANÇADO",
  };
  return levelMap[level] || level.toUpperCase();
};

const getLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    beginner: "text-green-500",
    intermediate: "text-orange-500",
    advanced: "text-red-500",
  };
  return colorMap[level] || "text-orange-500";
};

export function CourseBanner({ course, userProgress }: CourseBannerProps) {
  const router = useRouter();
  const refreshEnrolledCourses = useEnrolledCoursesStore(
    (state) => state.refreshEnrolledCourses
  );

  const [showSticky, setShowSticky] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Garante que o componente está montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verifica se o usuário está inscrito no curso
  useEffect(() => {
    if (!mounted) return;
    async function checkEnrollment() {
      try {
        const { userCourses } = await getUserEnrolledList();
        const enrolled = userCourses.some(
          (enrolledCourse) => enrolledCourse.courseId === course.id
        );
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error("Erro ao verificar inscrição:", error);
        setIsEnrolled(false);
      } finally {
        setIsCheckingEnrollment(false);
      }
    }
    checkEnrollment();
  }, [course.id, mounted]);

  useEffect(() => {
    const scrollContainer = document.querySelector(
      '[class*="overflow-y-auto"]'
    ) as HTMLElement;
    if (!scrollContainer) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowSticky(scrollContainer.scrollTop > 440);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll(); // initial state

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={cn(
          "sticky lg:top-[0px] top-[-1px] z-50 transition-all shadow-2xl duration-300 border-b border-[#25252A] bg-[#151518] p-3 px-4",
          showSticky
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none h-0 overflow-hidden p-0"
        )}
      >
        <div className="flex items-center justify-between lg:px-4 px-0">
          <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-xl">
            {course.title}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (isEnrolled || isEnrolling) return;
                try {
                  setIsEnrolling(true);
                  const { enrollInCourse } = await import(
                    "@/actions/course/enroll"
                  );
                  await enrollInCourse(course.id);
                  setIsEnrolled(true);
                  await refreshEnrolledCourses();
                } catch (error) {
                  console.error("Erro ao inscrever no curso:", error);
                  alert(
                    error instanceof Error
                      ? error.message
                      : "Erro ao inscrever no curso"
                  );
                } finally {
                  setIsEnrolling(false);
                }
              }}
              disabled={isEnrolled || isEnrolling}
              className="h-[42px] w-[42px] flex items-center justify-center border-[2px] rounded-full border-[#515155] hover:bg-[#424141] disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              {mounted && isEnrolled ? (
                <CheckCircle weight="fill" />
              ) : (
                <PlusIcon />
              )}
            </button>
            <button className="h-[42px] w-[42px] flex items-center justify-center border-[2px] rounded-full border-[#515155] hover:bg-[#424141]">
              <ThumbsUpIcon />
            </button>
            <Button
              onClick={async () => {
                try {
                  setIsLoading(true);

                  // Se não estiver inscrito, faz enroll primeiro
                  if (!isEnrolled) {
                    const { enrollInCourse } = await import(
                      "@/actions/course/enroll"
                    );
                    await enrollInCourse(course.id);
                  }

                  // Inicia o curso (define como ativo)
                  const { startCourse } = await import(
                    "@/actions/course/start"
                  );
                  await startCourse(course.id);

                  // Redirecionar para /learn
                  router.push("/learn");
                } catch (error) {
                  console.error("Erro ao iniciar curso:", error);
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || isCheckingEnrollment}
              className="bg-blue-gradient-500 transition-all rounded-[12px] duration-300 hover:shadow-[0_0_12px_#00C8FF] font-semibold px-6 py-2 h-[42px] disabled:opacity-50"
              suppressHydrationWarning
            >
              <PlayIcon weight="fill" />{" "}
              {mounted && isLoading
                ? "Carregando..."
                : mounted && isCheckingEnrollment
                  ? "Verificando..."
                  : mounted && isEnrolled
                    ? "Continuar"
                    : "Inscrever"}
            </Button>
          </div>
        </div>
      </div>

      <section className="relative bg-gray-gradient lg:gap-20 gap-8 border-b border-[#25252A] lg:py-12 lg:px-12 px-6 pb-8 pt-4 flex flex-col lg:flex-row items-center">
        {/* Blur gradient overlay - Netflix style */}
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
        <div className="flex-col flex-1 relative z-10 w-full">
          <div className="w-full lg:hidden block">
            <button
              onClick={() => router.back()}
              className="lg:hidden block"
            >
              <div className="flex items-center gap-2 cursor-pointer mb-2 text-sm text-[#7e7e89]">
                <ArrowLeft size={16} className="text-[#7e7e89]" />
                Voltar
              </div>
            </button>
          </div>
          <button
            onClick={() => router.back()}
            className="lg:flex hidden hover:bg-[#25252A] max-w-[80px] p-1 items-start rounded-lg justify-center mb-4 text-[#7e7e89] hover:text-white"
          >
            <div className="flex items-center justify-center gap-3">
              <ArrowLeft size={16} className="" />
              <p className="text-[12px] ">Voltar</p>
            </div>
          </button>
          <div className="lg:block lg:mr-6 mr-0 flex items-center justify-center">
            {course.icon && (
              <Image
                src={course.icon}
                alt={course.title}
                width={120}
                height={120}
              />
            )}
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex flex-col">
              {/* <div
                className="py-1 mb-4 w-full flex lg:items-start items-center lg:justify-start justify-center max-w-[120px]
              "
              >
                <Image src={codeLegendsLogo} alt="Code Legends" />
              </div> */}
              <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent lg:text-4xl text-xl lg:text-left text-center">
                {course.title}
              </span>
              <p className="lg:text-base text-sm mt-2 text-center lg:text-left max-w-[620px] text-[#a5a5a6]">
                {course.description}
              </p>
            </div>

            <div className="flex-col items-center gap-4 justify-center pb-6 mt-6 w-full">
              <div className="flex items-center gap-4">
                <Progress
                  value={userProgress?.course.progress ?? 0}
                  className="w-full bg-[#25252A] h-[2px]"
                />
                <p className="text-sm text-center">
                  {Math.round(userProgress?.course.progress ?? 0)}%
                </p>
                <Trophy size={32} weight="fill" className="text-[#25252A]" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div></div>
                <button
                  onClick={() => setShowResetModal(true)}
                  disabled={isResetting}
                  className="hover:bg-[#25252A] text-[#a5a5a6] rounded-lg p-2 mt-2 flex gap-3 items-center group transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowClockwise
                    size={24}
                    weight="fill"
                    className={cn(
                      "text-[#a5a5a6] group-hover:text-[#00C8FF] transition-colors duration-300",
                      isResetting && "animate-spin"
                    )}
                  />
                  {isResetting ? "Resetando..." : "Resetar curso"}
                </button>

                <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
                  <DialogContent className="max-w-md bg-[#1a1a1e] border-[#25252A]">
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl">
                        Resetar Progresso do Curso
                      </DialogTitle>
                      <DialogDescription className="text-[#a5a5a6] pt-2">
                        Tem certeza que deseja resetar o progresso deste curso?
                        Esta ação não pode ser desfeita e todos os seus
                        progressos neste curso serão perdidos.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:gap-0">
                      <Button
                        variant="ghost"
                        onClick={() => setShowResetModal(false)}
                        disabled={isResetting}
                        className="text-[#a5a5a6] hover:text-white hover:bg-[#25252A]"
                      >
                        Cancelar
                      </Button>
                      <PrimaryButton
                        onClick={async () => {
                          try {
                            setIsResetting(true);
                            const { resetCourseProgress } = await import(
                              "@/actions/course/reset-progress"
                            );
                            const result = await resetCourseProgress(course.id);

                            if (result.success) {
                              setShowResetModal(false);
                              // Aguarda um pouco para garantir que o backend processou o reset
                              await new Promise((resolve) => setTimeout(resolve, 500));
                              // Atualiza a lista de cursos inscritos
                              await refreshEnrolledCourses();
                              // Recarrega a página para atualizar o progresso e roadmap
                              router.refresh();
                            } else {
                              alert(
                                result.error ||
                                "Erro ao resetar progresso do curso"
                              );
                            }
                          } catch (error) {
                            console.error("Erro ao resetar progresso:", error);
                            alert(
                              error instanceof Error
                                ? error.message
                                : "Erro ao resetar progresso do curso"
                            );
                          } finally {
                            setIsResetting(false);
                          }
                        }}
                        disabled={isResetting}
                        variant="primary"
                        className="bg-red-600 hover:bg-red-700 mt-8"
                      >
                        {isResetting ? "Resetando..." : "Confirmar Reset"}
                      </PrimaryButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex items-start lg:justify-start justify-between gap-4 w-full">
              <Button
                onClick={async () => {
                  try {
                    setIsLoading(true);

                    // Se não estiver inscrito, faz enroll primeiro
                    if (!isEnrolled) {
                      const { enrollInCourse } = await import(
                        "@/actions/course/enroll"
                      );
                      await enrollInCourse(course.id);
                    }

                    // Inicia o curso (define como ativo)
                    const { startCourse } = await import(
                      "@/actions/course/start"
                    );
                    await startCourse(course.id);

                    // Redirecionar para /learn
                    router.push("/learn");
                  } catch (error) {
                    console.error("Erro ao iniciar curso:", error);
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading || isCheckingEnrollment}
                className="lg:w-fit w-full h-[50px] text-lg bg-blue-gradient-500 transition-all rounded-[12px] duration-300 hover:shadow-[0_0_12px_#00C8FF] font-medium disabled:opacity-50"
                suppressHydrationWarning
              >
                <PlayIcon weight="fill" />{" "}
                {mounted && isLoading
                  ? "Carregando..."
                  : mounted && isCheckingEnrollment
                    ? "Verificando..."
                    : mounted && isEnrolled
                      ? "Continuar"
                      : "Inscrever-se"}
              </Button>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (isEnrolled || isEnrolling) return;
                    try {
                      setIsEnrolling(true);
                      const { enrollInCourse } = await import(
                        "@/actions/course/enroll"
                      );
                      await enrollInCourse(course.id);
                      setIsEnrolled(true);
                      await refreshEnrolledCourses();
                    } catch (error) {
                      console.error("Erro ao inscrever no curso:", error);
                      alert(
                        error instanceof Error
                          ? error.message
                          : "Erro ao inscrever no curso"
                      );
                    } finally {
                      setIsEnrolling(false);
                    }
                  }}
                  disabled={isEnrolled || isEnrolling}
                  className="h-[50px] w-[50px] flex items-center justify-center border-[2px] rounded-full border-[#515155] hover:bg-[#424141] disabled:opacity-50 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {mounted && isEnrolled ? <Check /> : <PlusIcon />}
                </button>
                {/* Dropdown shadcn para reações */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-[50px] w-[50px] flex items-center justify-center border-[2px] rounded-full border-[#515155] hover:bg-[#424141]">
                      <ThumbsUpIcon />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="center"
                    sideOffset={10}
                    className="rounded-full px-2 py-1 bg-[#1e1e22] border border-[#2a2a2f] flex items-center gap-2 shadow-[0_0_16px_#000]"
                  >
                    <DropdownMenuItem className="rounded-full flex items-center justify-center h-[50px] w-[50px] px-2 py-1 hover:bg-[#2a2a2f] text-white">
                      <ThumbsDown className="w-8 h-8" />{" "}
                      {/* ou w-full h-full */}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-full flex items-center justify-center h-[50px] w-[50px] px-2 py-1 hover:bg-[#2a2a2f] text-white">
                      <ThumbsUpIcon className="w-8 h-8" />{" "}
                      {/* ou w-full h-full */}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full relative z-10">
          <ul>
            <li className="flex w-full items-center gap-3 py-4 border-b border-[#25252A]">
              <Certificate size={24} className="text-[#00C8FF]" />
              <p className="whitespace-nowrap text-[#a5a5a6] text-sm">
                Ganhe um certificado de conclusão
              </p>
            </li>
            <li className="flex w-full items-center gap-3 py-4  border-b border-[#25252A]">
              <PuzzlePiece size={24} className="text-[#00C8FF]" />
              <p className="whitespace-nowrap text-[#a5a5a6] text-sm">
                <strong className="text-[#c0c0d1]">7</strong> Projetos
              </p>
            </li>
            <li className="flex w-full items-center gap-3 py-4  border-b border-[#25252A]">
              <VideoCameraIcon size={24} className="text-[#00C8FF]" />
              <p className="whitespace-nowrap text-[#a5a5a6] text-sm">
                <strong className="text-[#c0c0d1]">
                  {course.totalDuration ? `+${course.totalDuration}` : "0h"}
                </strong> de conteúdo
              </p>
            </li>
            <li className="flex w-full items-center gap-3 py-4  border-b border-[#25252A]">
              <ChartNoAxesColumnIncreasingIcon
                size={24}
                className={getLevelColor(course.level)}
              />
              <p className="whitespace-nowrap text-[#a5a5a6] text-sm font-light">
                {getLevelLabel(course.level)}
              </p>
            </li>
          </ul>
          <div className="mt-4 h-full">
            <p className="text-[12px] text-muted-foreground">INSTRUTOR</p>
            {course.instructor && (
              <div className="flex items-center gap-3 mt-4">
                <Avatar className="h-[32px] w-[32px]">
                  <AvatarImage src={course.instructor.avatar || ""} />
                  <AvatarFallback>
                    {course.instructor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-white text-sm">{course.instructor.name}</p>
                  <p className="text-xs text-[#929191] italic leading-tight">Educator</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
