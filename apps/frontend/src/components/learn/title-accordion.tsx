"use client";

import { MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { continueCourse } from "@/actions/course";
import { useState, useEffect } from "react";
import { useActiveCourseStore } from "@/stores/active-course-store";
import { useCourseModalStore } from "@/stores/course-modal-store";

interface TitleAccordinProps {
  title: string | undefined;
  description: string | undefined;
}

export function TitleAccordion({ title, description }: TitleAccordinProps) {
  const [isMarking, setIsMarking] = useState(false);
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore();
  const { currentLesson, updateCurrentLessonStatus } = useCourseModalStore();

  // Verifica se a lição atual já está marcada como completada
  const isMarked = currentLesson?.status === "completed";

  // Debug: verifica se currentLesson está disponível
  useEffect(() => {
  }, [currentLesson]);

  const handleMarkAsWatched = async () => {
    
    if (!currentLesson?.id) {
      console.error("currentLesson não tem ID:", currentLesson);
      alert("Erro: Lição não encontrada. Recarregue a página.");
      return;
    }
    
    if (isMarking || isMarked) {
      return;
    }

    // Verifica se a aula está bloqueada antes de tentar completá-la
    if (currentLesson.status === "locked") {
      alert("Esta aula está bloqueada. Complete as aulas anteriores para desbloqueá-la.");
      return;
    }

    try {
      setIsMarking(true);
      
      const result = await continueCourse(currentLesson.id, activeCourse?.id);
      
      if (!result || !result.success) {
        throw new Error("A API não retornou sucesso ao completar a lição");
      }

      // Atualiza o status da lição atual no modal imediatamente
      updateCurrentLessonStatus("completed");

      // Atualiza o curso ativo para refletir o progresso
      await fetchActiveCourse();
      ;
    } catch (error) {
      console.error("Erro ao marcar como assistido:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // Se o erro for sobre aula bloqueada, mostra mensagem mais clara
      if (errorMessage.includes("locked") || errorMessage.includes("bloqueada")) {
        alert("Esta aula está bloqueada. Complete as aulas anteriores para desbloqueá-la. Se você acabou de resetar o curso, aguarde alguns segundos e recarregue a página.");
      } else {
        alert(`Erro ao marcar como assistido: ${errorMessage}. Tente novamente.`);
      }
    } finally {
      setIsMarking(false);
    }
  };
  return (
    <>
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="item-1">
          <div className="w-full mx-auto lg:rounded-[20px] rounded-none bg-[#0C0C0F] border border-[#2A2A2A] shadow-xl mb-4
            border-l-0 border-r-0 lg:border-l lg:border-r"
          >
            <AccordionTrigger className="group w-full lg:px-8 px-6 lg:py-8 py-4">
              <div className="flex justify-between w-full items-center">
                <div>
                  <span className="lg:block hidden bg-blue-gradient-500 bg-clip-text text-transparent lg:text-[20px] text-[16px] font-bold">
                    {title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="lg:flex hidden items-center gap-2 border border-[#25252A] px-3 py-2 rounded-full text-sm text-white whitespace-nowrap mr-4 font-normal">
                    <MessageCircle size={16} /> 3 comentários
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsWatched();
                    }}
                    className={`lg:flex hidden items-center gap-2 border px-3 py-2 rounded-full text-sm text-white whitespace-nowrap mr-4 font-normal transition-all ${
                      isMarking || isMarked || !currentLesson
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-[#00b3e4]"
                    } ${
                      isMarked
                        ? "border-[#00b3e4] bg-green-500/10"
                        : "border-[#25252A]"
                    }`}
                  >
                    <Check
                        weight="bold"
                        className={isMarked ? "text-[#00b3e4]" : "text-[#00b3e4]"}
                    />{" "}
                    {isMarking
                      ? "Marcando..."
                      : isMarked
                      ? "Completa"
                      : "Completar lição"}
                  </div>
                </div>
                <div className="lg:hidden flex flex-row items-center gap-2 w-full">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsWatched();
                    }}
                    className={`flex-1 flex items-center shadow-2xl justify-center gap-2 border px-3 py-2 rounded-[14px] text-sm text-white whitespace-nowrap font-normal transition-all ${
                      isMarking || isMarked || !currentLesson
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-green-500"
                    } ${
                      isMarked
                        ? "bg-[#25252a] border-none"
                        : "border-[#25252A]"
                    }`}
                  >
                    <Check
                      size={16}
                      weight="bold"
                      className={isMarked ? "text-[#00b3e4]" : "text-[#00b3e4]"}
                    />
                   <p className="font-semibold"> {isMarking
                      ? "Marcando..."
                      : isMarked
                      ? "Completa"
                      : "Completar"}</p>
                  </div>
                  <div className="flex items-center gap-2 border border-[#25252A] px-3 py-2 rounded-[14px] text-sm text-white whitespace-nowrap font-normal shrink-0">
                    <MessageCircle size={20} />
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="lg:px-8 px-6 pb-8 text-white">
              <p className="lg:text-sm text-xs text-muted-foreground font-normal mb-6">
                {description}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Avatar className="h-[32px] w-[32px]">
                  <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?s=400&u=415dc8fde593b5dcbdef181e6186a8d80daf72fc&v=4" />
                  <AvatarFallback>JV</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-white">João Victor</p>
                  <p className="text-xs text-[#c4c4c4]">Educator</p>
                </div>
              </div>
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </>
  );
}
