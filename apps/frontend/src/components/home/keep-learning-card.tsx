"use client";

import type { EnrolledCourse } from "@/types/user-course.ts";
import Image from "next/image";
import { Play } from "lucide-react";
import { Progress } from "../ui/progress";
import { useStartCourse } from "@/hooks/use-start-course";
import Link from "next/link";

interface KeepLearningCardProps {
    course: EnrolledCourse;
    glowColor?: "blue" | "purple" | "orange" | "green";
    progress: number;
}

export function KeepLearningCard({ course, progress }: KeepLearningCardProps) {
    const { startAndNavigate, isLoading } = useStartCourse();

    const progressValue = progress > 1
        ? Math.min(Math.max(Number(progress) || 0, 0), 100)
        : Math.min(Math.max((Number(progress) || 0) * 100, 0), 100);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        await startAndNavigate(course.courseId);
    };

    return (
        <div
            className="cursor-pointer"
        >
            <Link href={`/learn/paths/${course.course.slug}`}>
                <div className={`flex items-center gap-4 px-4 py-2 bg-[#151517] rounded-[20px] border border-[#25252A] transition-opacity ${isLoading ? "opacity-50" : ""}`}>
                    <div>
                        {course.course.icon && (
                            <Image
                                src={course.course.icon}
                                alt={course.course.title}
                                width={32}
                                height={32}
                                className="object-cover h-14 w-14"
                            />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-[#C2C2C2] text-[10px] font-light uppercase mb-1">
                            CURSO
                        </p>
                        <h3 className={`font-semibold text-base truncate text-white`}>
                            {course.course.title}
                        </h3>
                    </div>

                    <button
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-[#25252A] hover:bg-[#2E2E32] flex items-center justify-center transition-colors"
                        disabled={isLoading}
                        onClick={handleClick}
                    >
                        <Play size={20} className="text-white ml-0.5" fill="white" />
                    </button>
                </div>

                <div className="mt-4 w-full flex items-center justify-center">
                    <Progress
                        value={progressValue}
                        className="h-[2px] bg-[#25252A] max-w-[164px]"
                    />
                </div>
            </Link>
        </div>
    );
}


