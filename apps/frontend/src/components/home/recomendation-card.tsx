"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import reactIcon from "../../../public/react-course-icon.svg";
import {
    ArrowUpRight,
    ChartNoAxesColumnIncreasing,
    ScrollText,
} from "lucide-react";
import { Check, Plus, Star } from "@phosphor-icons/react/dist/ssr";
import { enrollInCourse } from "@/actions/course";
import { useState } from "react";
import { useEnrolledCoursesStore } from "@/stores/enrolled-courses-store";

// Componente para o botão de enroll
function EnrollButton({
    courseId,
    onEnrollSuccess,
}: {
    courseId?: string;
    onEnrollSuccess?: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const userCourses = useEnrolledCoursesStore((state) => state.userCourses);
    const refreshEnrolledCourses = useEnrolledCoursesStore(
        (state) => state.refreshEnrolledCourses
    );

    // Verifica se o curso está inscrito usando o store
    const isEnrolled = courseId
        ? userCourses.some((course) => course.courseId === courseId)
        : false;

    const handleEnroll = async () => {
        if (!courseId || isLoading || isEnrolled) return;

        try {
            setIsLoading(true);
            await enrollInCourse(courseId);
            onEnrollSuccess?.();

            // Atualiza apenas a lista de cursos inscritos sem recarregar toda a página
            await refreshEnrolledCourses();
        } catch (error) {
            console.error("Erro ao inscrever:", error);
            alert(
                error instanceof Error ? error.message : "Erro ao inscrever no curso"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Se já está inscrito, mostra o check
    if (isEnrolled) {
        return (
            <div className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:text-[#35BED5]">
                <Check
                    size={20}
                    className="text-green-500 hover:text-[#35BED5]"
                />
            </div>
        );
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={!courseId || isLoading}
            className="bg-gray-gradient-first rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="flex items-center justify-center w-8 h-8 hover:bg-[#25252A] rounded-full cursor-pointer hover:text-[#35BED5]">
                <Plus size={28} className="text-white hover:text-[#35BED5]" />
            </div>
        </button>
    );
}

function getStatusInfo(status?: RecomendationCardProps["status"]) {
    switch (status) {
        case "in-progress":
            return {
                label: "Em progresso...",
                className: "text-[#007e97]",
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? "text-[#35BED5]" : "text-gray-600"}
                    />
                ),
            };
        case "completed":
            return {
                label: "Concluído",
                className: "text-green-600",
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? "text-[#35BED5]" : "text-gray-600"}
                    />
                ),
            };
        case "career":
        case "continue":
            return {
                label: "Curso atual",
                className: "text-white",
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? "text-[#35BED5]" : "text-gray-600"}
                    />
                ),
            };
        case "not-started":
        default:
            return {
                label: "Curso",
                className: "text-gray-500",
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? "text-[#35BED5]" : "text-gray-600"}
                    />
                ),
            };
    }
}

function getAudienceLabelFromLevel(level?: string): string {
    const normalized = (level ?? "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (normalized === "beginner" || normalized === "iniciante") return "Iniciantes";
    if (normalized === "intermediate" || normalized === "intermediario") return "Intermediários";
    if (normalized === "advanced" || normalized === "avancado") return "Avançados";

    return "Avançados";
}

function getAccentClassFromLevel(level?: string): string {
    const normalized = (level ?? "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (normalized === "beginner" || normalized === "iniciante") return "text-green-500";
    if (normalized === "intermediate" || normalized === "intermediario") return "text-orange-500";
    if (normalized === "advanced" || normalized === "avancado") return "text-violet-700";

    return "text-green-500";
}

interface RecomendationCardProps {
    name: string;
    image?: string | StaticImageData;
    url: string;
    color: string;
    className?: string;
    isCurrent?: boolean;
    isFavorite?: boolean;
    status?: "in-progress" | "completed" | "not-started" | "career" | "continue";
    tags?: string[];
    courseId?: string;
    onEnrollSuccess?: () => void;
    level?: string;
    isFree?: boolean;
}

export function RecomendationCard({
    name,
    image,
    url,
    status,
    className,
    isCurrent,
    courseId,
    onEnrollSuccess,
    level,
    isFree,
}: RecomendationCardProps) {
    const imageSrc = image || reactIcon;

    const { label, className: statusClass } = getStatusInfo(status);
    return (
        <div
            className={`relative shadow-2xl w-full rounded-[16px] min-w-[300px] h-[280px] flex flex-col transition-colors duration-300 cursor-pointer hover:border-[#3f3f48]
    ${isCurrent
                    ? "bg-blue-gradient-second border-[#35BED5]"
                    : "bg-gray-gradient border-[#25252A]"
                }
    border hover:shadow-[inset_0_-20px_20px_rgba(255,255,255,0.025)] ${className}`}
        >
            {label && (
                <div className="flex items-center justify-between rounded-t-[20px] pr-4 pl-4 pt-4 pb-0">
                    <div
                        className={`text-white ${statusClass} rounded-full px-2 border ${isCurrent ? "border-white" : "border-[#25252A]"
                            }`}
                    >
                        <p className="text-sm">{label}</p>
                    </div>
                    {isFree && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5">
                            <p className="text-xs text-green-400 font-semibold">Gratuito</p>
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 flex-1 flex flex-col">
                <Image
                    src={imageSrc}
                    alt={name}
                    width={80}
                    height={80}
                    className="mb-3"
                />
                <div className="px-4 pt-2 flex-1">
                    <div className="flex items-center space-x-1">
                        <span className={`font-semibold bg-clip-text text-base text-white line-clamp-2`}>
                            {name}
                        </span>
                        <ArrowUpRight className="flex-shrink-0" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pr-4 pl-4 pb-4 mt-auto">
                <div className="flex items-center gap-2 text-xs text-white">
                    <ChartNoAxesColumnIncreasing size={16} className={getAccentClassFromLevel(level)} />
                    <p className="text-muted-foreground">
                        Para{" "}
                        {getAudienceLabelFromLevel(level)}
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-8 hover:bg-[#25252A] rounded-full cursor-pointer hover:text-[#35BED5]">
                        <Link href={url}>
                            <ScrollText size={20} className="text-gray-600" />
                        </Link>
                    </div>

                    <EnrollButton
                        courseId={courseId}
                        onEnrollSuccess={onEnrollSuccess}
                    />
                </div>
            </div>
        </div>
    );
}
