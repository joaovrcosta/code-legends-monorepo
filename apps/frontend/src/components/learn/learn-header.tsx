"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LearnHeaderProps {
  currentModule: number;
  currentClass: number;
  courseTitle: string;
  lessonTitle: string;
  onToggleModules: () => void;
  loadingModules?: boolean;
}

export function LearnHeader({
  currentModule,
  currentClass,
  courseTitle,
  lessonTitle,
  loadingModules = false,
}: LearnHeaderProps) {
  const router = useRouter();

  const handleToggleModules = () => {
    // Redireciona para a página de módulos
    router.push("/learn/sections");
  };

  return (
    <div className="w-full max-w-[713px] lg:sticky md:sticky fixed mt-[48px] lg:mt-0 md:mt-0 top-0 z-10 mb-8 px-4 md:pt-2 pt-4 lg:pt-0">
      <div className="bg-[#121214] px-4 flex items-center justify-between h-[24px]"></div>
      <section className="bg-gray-gradient border border-[#25252A] px-4 py-4 flex items-center shadow-lg rounded-lg w-full max-w-[712px] justify-between sticky top-0 z-10 bg-[#1a1a1e]">
        <div className="flex flex-col lg:ml-4">
          <Link href="/learn/catalog">
            <div className="flex items-center gap-2 cursor-pointer mb-2 text-xs text-[#7e7e89]">
              <ArrowLeft size={16} className="text-[#7e7e89]" />
              Módulo {currentModule}, Aula {currentClass}
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div>
              <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-sm">
                {courseTitle}
              </span>
              <p className="text-xl ">{lessonTitle}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleToggleModules}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          disabled={loadingModules}
        >
          <ChevronRight size={48} />
        </button>
      </section>
    </div>
  );
}
