import { BadgeCard } from "@/components/badges/badge-card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Question, Sticker } from "@phosphor-icons/react/dist/ssr";

export default function BadgePage() {
  return (
    <div className="py-4 lg:px-12 px-0">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full flex-col px-0 py-6 flex">
          <div className="flex items-center justify-start space-x-2">
            <Sticker className="text-[#00C8FF]" size={28} weight="fill" />
            <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg">
              Emblemas
            </span>
            <div className="flex items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {" "}
                    <Question size={20} className="text-[#414147]" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[412px]">
                    <p className="text-xs">
                      <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-xs">
                        Emblemas
                      </span>{" "}
                      são pequenos cartões que servem para testar sua memória.
                      Explicando de forma simples: de um lado, eles têm
                      perguntas, e do outro, as respostas. É possível variar
                      também, com tópicos e palavras-chave ou termos e
                      definições.{" "}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="mt-4">
            <Input
              className="rounded-full h-[52px] lg:max-w-[312px] w-full border-[#25252A] px-4 shadow-lg"
              placeholder="Pesquisar Flashcard"
            />
          </div>
        </div>
        <div className="w-full lg:pb-0 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="Componentes"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge.svg"
              buttonText="Iniciar Teste"
              description="Entenda a estrutura dos componentes no React."
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="Tipografia"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge-uiux.svg"
              buttonText="Iniciar Teste"
              description="Como passar e gerenciar dados entre componentes."
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="Verbo To be"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge-english.svg"
              buttonText="Iniciar Teste"
              description="Lidar com efeitos colaterais em componentes"
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="UseState"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge.svg"
              buttonText="Iniciar Teste"
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="Componentes"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge.svg"
              buttonText="Iniciar Teste"
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="Propriedades"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge.svg"
              buttonText="Iniciar Teste"
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="UseEffect"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge.svg"
              buttonText="Iniciar Teste"
            />
            <BadgeCard
              className="bg-[#222] hover:bg-[#333]"
              badgeTitle="UseState"
              badgeSubtitle="BADGE"
              badgeImage="/shield-badge.svg"
              buttonText="Iniciar Teste"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
