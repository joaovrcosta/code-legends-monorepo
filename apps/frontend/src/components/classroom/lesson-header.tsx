"use client";

import { ArrowLeft, Play, Pause } from "lucide-react";
import { useState, memo, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LessonHeaderProps {
  courseTitle?: string;
  moduleTitle?: string;
  groupTitle?: string;
  courseIcon?: string;
}

export const LessonHeader = memo(function LessonHeader({
  courseTitle,
  moduleTitle,
  groupTitle,
  courseIcon,
}: LessonHeaderProps) {
  const router = useRouter();
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const breadcrumbPath = useMemo(() => {
    return [courseTitle, moduleTitle, groupTitle]
      .filter(Boolean)
      .join(" / ");
  }, [courseTitle, moduleTitle, groupTitle]);

  return (
    <div className="w-full lg:px-4 px-0 lg:pt-2 pt-0">
      {/* Header principal */}
      <div className="bg-[#121214]/90 border border-white/10 lg:rounded-[16px] rounded-none shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between px-4 lg:py-3 py-2">
          {/* Lado esquerdo */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex-shrink-0 text-white hover:text-[#00C8FF] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="h-6 w-px bg-[#25252A]" />

            {/* Ícone do curso */}
            {courseIcon ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={courseIcon}
                  alt={courseTitle || "Curso"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {courseTitle?.[0]?.toUpperCase() || "C"}
                </span>
              </div>
            )}

            {/* Breadcrumb */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#C4C4CC] truncate">
                {breadcrumbPath || "Curso"}
              </p>
            </div>
          </div>

          {/* Lado direito */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Reprodução automática */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#787878] hidden lg:block">
                Reprodução automática
              </span>
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isAutoplay ? "bg-[#00C8FF]" : "bg-[#25252A]"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAutoplay ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Botões de controle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-[#25252A] flex items-center justify-center text-white hover:bg-[#2a2a2e] transition-colors"
              >
                {isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>

              {/* Ícone de documento/notas */}
              <button className="w-8 h-8 rounded-full bg-[#25252A] flex items-center justify-center text-white hover:bg-[#2a2a2e] transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 2C2 1.44772 2.44772 1 3 1H8.58579C8.851 1 9.10536 1.10536 9.29289 1.29289L13.7071 5.70711C13.8946 5.89464 14 6.149 14 6.41421V14C14 14.5523 13.5523 15 13 15H3C2.44772 15 2 14.5523 2 14V2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M8 1V5C8 5.55228 8.44772 6 9 6H13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="5" cy="10" r="0.5" fill="currentColor" />
                  <path
                    d="M5 11.5H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

