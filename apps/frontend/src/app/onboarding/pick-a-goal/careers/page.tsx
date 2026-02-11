"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOnboarding } from "@/actions/user";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import codeLogo from "../../../../../public/code-legends-logo.svg";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { listCategories } from "@/actions/course/list-categories";
import { Category } from "@/types/categories";

export default function CareersPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await listCategories();
        setCategories(data); // ✅ Corrigido — apenas define o array
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Não foi possível carregar as categorias.");
      }
    }
    fetchCategories();
  }, []);

  const handleContinue = async () => {
    if (!selectedCareer) return;

    try {
      setIsLoading(true);
      setError("");
      await updateOnboarding({ career: selectedCareer });
      router.push(
        `/onboarding/pick-a-goal/careers/choose-course?categorySlug=${selectedCareer}`
      );
    } catch (error) {
      console.error("Erro ao salvar carreira:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao salvar carreira. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 lg:p-20">
      <div className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] top-0 left-0 rounded-full bg-[#00b3ffa9] opacity-40 blur-[100px] md:blur-[150px] lg:blur-[200px] pointer-events-none" />
      <div className="absolute w-[150px] h-[150px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] top-[10%] left-[20%] md:top-[15%] md:left-[25%] lg:top-[20%] lg:left-[30%] rounded-full bg-[#00b3ff5b] opacity-30 blur-[100px] md:blur-[150px] lg:blur-[200px] pointer-events-none" />
      <div className="absolute w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bottom-0 right-0 rounded-full bg-[#00b3ffb6] opacity-40 blur-[120px] md:blur-[180px] lg:blur-[220px] pointer-events-none" />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-16">
          <Image src={codeLogo} alt="" quality={100} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium">2</span>
          <Progress value={66} className="flex-1" />
          <span className="text-white/60 text-sm">3</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-[28px] font-semibold text-white mb-3">
            Qual sua meta com a programação?
          </h1>
          <p className="text-white/70 text-base">
            Por qual área você quer se especializar?
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-3 mb-8 z-50">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCareer(category.slug)}
              disabled={isLoading}
              className={`w-full p-3 rounded-full px-4 border flex justify-start items-center text-left h-[54px] ${
                selectedCareer === category.slug
                  ? "border-[#00C8FF] shadow-[0_0_12px_#00C8FF]"
                  : "border-[#25252A] bg-[#1A1A1E] hover:border-[#3A3A3F]"
              }`}
            >
              <p className="text-white text-sm">
                <span className="mr-2">{category.icon}</span> Quero ser um{" "}
                {category.name}
              </p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 z-50">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-[#25252A] border border-[#3A3A3F] flex items-center justify-center hover:bg-[#3A3A3F] transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="text-white" size={20} />
          </button>

          <PrimaryButton
            onClick={handleContinue}
            disabled={!selectedCareer || isLoading}
            className="min-w-[200px] max-w-[200px] z-50"
          >
            {isLoading ? "Carregando..." : "Continuar"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
