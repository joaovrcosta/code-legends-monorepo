import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Info } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import genesisIcon from "../../../../public/code-genesis.svg";
import genesisBackground from "../../../../public/code-genesis-image.png";
import { Plus } from "lucide-react";

export function NewContentCard() {
  return (
    <>
      <div className="bg-gray-gradient border border-[#25252A] rounded-[16px] mb-4 flex max-h-[400px] lg:h-full overflow-hidden shadow-xl min-w-0 w-full">
        {/* Lado esquerdo */}
        <div className="relative lg:px-8 px-4 lg:pb-8 pb-4 lg:pt-4 pt-2 flex flex-col justify-between">
          {/* Fade direito */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#121214] to-transparent z-10" />

          <div>
            <Image src={genesisIcon} alt="" className="-ml-5" />
            <h3 className="text-[20px]">Code Genesis</h3>
            <p className="text-muted-foreground text-[14px]">
              Aprenda a programar do zero, partindo dos princípios da web até
              criação de aplicações frontend e backend.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mt-6">
              <div className="flex text-xs items-center gap-2">
                <Avatar className="h-[24px] w-[24px]">
                  <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?s=400&u=415dc8fde593b5dcbdef181e6186a8d80daf72fc&v=4" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p>João Victor</p>
              </div>
              <div className="flex text-xs gap-2">
                <p className="text-muted-foreground">Curso</p>
                <p className="text-green-500">Para Iniciantes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button className="bg-gray-gradient-first text-white h-[42px] rounded-[12px] hover:bg-slate-200 border border-[#25252A] hover:text-black">
                <Plus size={32} />
                Adicionar
              </Button>
              <Button className="h-[44px] lg:w-[50px] w-full bg-[#1a1a1e] rounded-[12px]">
                <Info size={32} weight="fill" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lado direito */}

        <div className="flex-shrink-0 lg:w-[50%] w-[0%] h-full relative">
          {/* Fade esquerda */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#121214] to-transparent z-10" />

          <Image
            src={genesisBackground}
            alt=""
            className="h-full w-full object-cover object-center rounded-r-[16px] lg:block hidden"
          />
        </div>
      </div>
    </>
  );
}
