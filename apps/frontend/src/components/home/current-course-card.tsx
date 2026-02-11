import { getActiveCourse } from "@/actions/user/get-active-course";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { BarbellIcon, Trophy } from "@phosphor-icons/react/dist/ssr";
import { ContinueCourseButton } from "./continue-course-button";
import { getUserCourseProgress } from "@/actions/progress";

export async function CurrentCourseCard() {
    const activeCourse = await getActiveCourse();
    const userProgress = await getUserCourseProgress(activeCourse?.slug || "");

    if (!activeCourse) return null;

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-center rounded-[20px] bg-gradient-to-b border border-[#25252A] from-[#1a1a1e] to-[#0e0e0e] p-5 sm:p-6 gap-6">

                <div className="flex flex-col items-center lg:items-start w-full lg:w-auto">
                    <div className="mb-4">
                        <span className="bg-transparent text-[#737373] border border-[#737373] text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider">
                            Formação
                        </span>
                    </div>

                    <div className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-6">
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <Image
                                src={activeCourse.icon}
                                alt={activeCourse.title}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h2 className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-xl sm:text-2xl leading-tight">
                            {activeCourse.title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-[300px] lg:max-w-[280px]">
                        <div className="flex-1">
                            <Progress
                                value={userProgress?.course.progress ?? 0}
                                className="w-full bg-[#25252A] h-[4px]"
                            />
                        </div>
                        <span className="text-xs sm:text-sm text-[#737373] font-medium min-w-[35px]">
                            {Math.round(userProgress?.course.progress ?? 0)}%
                        </span>
                        <Trophy size={24} className="text-[#25252A]" weight="fill" />
                    </div>

                    <div className="hidden lg:block mt-6">
                        <button
                            type="button"
                            className="flex items-center h-[42px] gap-2 px-5 py-2 bg-[#222226] hover:bg-[#2E2E32] text-white text-sm rounded-xl transition-all active:scale-95"
                        >
                            <BarbellIcon size={20} className="text-[#FF6200]" weight="fill" />
                            Pratique
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col items-center gap-4">
                    <div className="w-full sm:w-[280px] lg:w-[220px]">
                        <ContinueCourseButton
                            courseId={activeCourse.id}
                            courseSlug={activeCourse.slug}
                        />
                    </div>

                    <button
                        type="button"
                        className="lg:hidden flex items-center justify-center w-full sm:w-[280px] h-[42px] gap-2 px-5 py-2 bg-[#222226] text-white text-sm rounded-xl border border-[#25252A]"
                    >
                        <BarbellIcon size={18} className="text-[#FF6200]" weight="fill" />
                        Pratique
                    </button>
                </div>
            </div>

            <div className="pt-4 px-2">
                <p className="text-[#737373] text-[11px] sm:text-xs text-center lg:text-left leading-relaxed">
                    Parte da jornada front-end{" "}
                    <Link
                        href="/learn"
                        className="text-[#00C8FF] hover:underline font-medium inline-block"
                    >
                        Veja a nossa Trilha de Aprendizado
                    </Link>
                </p>
            </div>
        </div>
    );
}