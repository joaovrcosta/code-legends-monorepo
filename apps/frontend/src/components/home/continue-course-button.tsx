"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { useCourseEnrollment } from "@/hooks/use-course-enrollment";
import { useState, useEffect } from "react";
import { getCourseRoadmapFresh } from "@/actions/course";
import { findLessonContext, generateLessonUrl } from "@/utils/lesson-url";
import type { Lesson } from "@/types/roadmap";

interface ContinueCourseButtonProps {
    courseId: string;
    courseSlug: string;
    className?: string;
}

export function ContinueCourseButton({
    courseId,
    className = "",
}: ContinueCourseButtonProps) {
    const router = useRouter();
    const { isEnrolled, isLoading, isCheckingEnrollment, handleStartCourse } =
        useCourseEnrollment(courseId);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick: () => Promise<void> = async () => {
        try {
            // Primeiro, inicia o curso (faz enroll se necessário)
            await handleStartCourse(courseId);

            // Busca o roadmap para encontrar a aula atual
            const roadmapData = await getCourseRoadmapFresh(courseId);

            if (roadmapData?.modules) {
                // Coleta todas as aulas do roadmap
                const allLessons = roadmapData.modules
                    .flatMap((module) => module?.groups || [])
                    .flatMap((group) => group?.lessons || []);

                // Encontra a aula atual (isCurrent) ou a primeira desbloqueada
                let targetLesson: Lesson | null = null;
                const foundCurrentLesson = allLessons.find((lesson) => lesson.isCurrent);

                // Só usa a aula atual se ela não estiver bloqueada
                if (foundCurrentLesson && foundCurrentLesson.status !== "locked") {
                    targetLesson = foundCurrentLesson;
                } else {
                    // Procura a primeira aula desbloqueada
                    targetLesson = allLessons.find((lesson) => lesson.status !== "locked") || null;
                }

                if (targetLesson) {
                    // Encontra o contexto da aula e gera a URL completa
                    const context = findLessonContext(
                        targetLesson.id,
                        roadmapData.modules
                    );

                    if (context) {
                        const url = generateLessonUrl(
                            targetLesson,
                            context.module,
                            context.group
                        );
                        router.push(url);
                        return;
                    }
                }
            }

            // Fallback: se não conseguir gerar URL, redireciona para /classroom
            router.push("/classroom");
        } catch {
            // Erro já foi logado no hook
        }
    };

    const getButtonText = () => {
        if (!mounted) return "Continuar";
        if (isLoading) return "Carregando...";
        if (isCheckingEnrollment) return "Verificando...";
        if (isEnrolled) return "Continuar";
        return "Inscrever";
    };

    return (
        <PrimaryButton
            onClick={handleClick}
            disabled={isLoading || isCheckingEnrollment}
            className={`w-full bg-blue-gradient-500 transition-all rounded-[12px] lg:text-[18px] text-[14px] duration-300 hover:shadow-[0_0_12px_#00C8FF] font-semibold px-6 py-2 lg:h-[50px] h-[42px] disabled:opacity-50 border-none ${className}`}
            suppressHydrationWarning
        >
            <span className="flex items-center gap-2">
                <Play size={20} weight="fill" className="text-white" />
                {getButtonText()}
            </span>
        </PrimaryButton>
    );
}
