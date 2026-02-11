"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ModuleWithProgress } from "@/types/roadmap";
import { PrimaryButton } from "@/components/ui/primary-button";
import { setCurrentModule } from "@/actions/course";
import { CheckCircle, Lock } from "@phosphor-icons/react/dist/ssr";
import { ModuleProgressBar } from "./module-progress-bar";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ModulesListProps {
  modules: ModuleWithProgress[];
  courseId: string;
  courseSlug: string;
  onToggle: () => void;
  onModuleChange?: () => void;
}

export function ModulesList({ modules, courseId, courseSlug }: ModulesListProps) {
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  const router = useRouter();

  const handleModuleClick = async (module: ModuleWithProgress) => {
    if (module.locked) return;

    setLoadingModuleId(module.id);
    try {
      const result = await setCurrentModule(courseId, module.id);
      if (result.success) {
        // Redirecionar para /learn com o roadmap carregado para aquela sessão
        router.push("/learn");
      } else {
        console.error("Erro ao atualizar módulo:", result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
    } finally {
      setLoadingModuleId(null);
    }
  };


  return (
    <div className="w-full flex flex-col items-center justify-center lg:mt-16 mt-2">
      <div className="w-full flex items-center justify-between max-w-[681px] lg:px-0 px-4 lg:mb-0 mb-0 lg:mt-0 mt-4">
       <Link
            href="/learn"
            className=" hover:bg-[#25252A] max-w-[100px] p-1 flex items-start rounded-lg justify-center mb-4 text-[#7e7e89] hover:text-white"
          >
            <div className="flex items-center justify-center gap-3">
              <ArrowLeft size={16} className="" />
              <p className="text-[12px] ">Voltar</p>
            </div>
          </Link>


          <Link
            href={`/learn/paths/${courseSlug}`}
            className=" hover:bg-[#25252A] max-w-[100px] p-1 flex items-start rounded-lg justify-center mb-4 text-[#7e7e89] hover:text-white"
          >
            <div className="flex items-center justify-center gap-3">
              <p className="text-[12px] ">Ver curso</p>
              <ArrowRight size={16} className="" />
            </div>
          </Link>
      </div>
      {modules.map((module) => {
        const isLoading = loadingModuleId === module.id;
        return (
          <div
            key={module.id}
            className="w-full max-w-[713px] lg:mb-4 mb-0 px-4 md:pt-2 pt-4 lg:pt-0"
          >
            <section
              className={`border border-[#25252A] px-6 py-6 pr-8 flex items-center shadow-lg rounded-[16px] w-full max-w-[713px] justify-between sticky top-0 z-10  ${
                module.isCurrent ? "bg-[#121214]" : "bg-[#121214]"
              }`}
            >
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between w-full flex-col">
                  <div className="flex items-start justify-between w-full mb-8">
                    <div className="">
                      <p className="text-xl font-semibold">{module.title}</p>
                      {module.progress !== 100 && (
                        <span className="text-white text-xs">
                          {module.totalLessons}{" "}
                          {module.totalLessons === 1 ? "aula" : "aulas"}
                        </span>
                      )}
                      {module.progress === 100 && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle
                            size={20}
                            weight="fill"
                            className="text-[#58cc02]"
                          />
                          <p className="text-[#58cc02] text-xs font-semibold">
                            COMPLETO!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      {module.locked ? (
                        <PrimaryButton
                          variant="secondary"
                          className="px-4 h-[40px] w-[140px] rounded-[12px]"
                          disabled
                        >
                          Bloqueado <Lock size={20} />
                        </PrimaryButton>
                      ) : module.isCurrent ? (
                        <PrimaryButton
                          className="px-4 w-[140px] h-[44px] rounded-[12px]"
                          onClick={() => handleModuleClick(module)}
                          disabled={isLoading}
                          variant="primary"
                        >
                          {isLoading ? "Carregando..." : "Continuar"}
                        </PrimaryButton>
                      ) : (
                        <PrimaryButton
                          variant="secondary"
                          className="px-4 h-[44px] w-[140px] rounded-[12px]"
                          onClick={() => handleModuleClick(module)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Carregando..." : "Revisar"}
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <ModuleProgressBar value={module.progress} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
