import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Fire, Plus, TicketIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import genesisBackground from "../../../public/image 14.png";

export function NewsBanner() {
    return (
        <>
            {/* AJUSTES:
                - lg:h-[280px]: Define a altura fixa no desktop conforme solicitado.
                - min-h-fit: Garante que no mobile o card cresça se o texto for longo.
            */}
            <div className="bg-gray-gradient border border-[#25252A] rounded-[20px] mb-4 flex flex-col lg:flex-row-reverse min-h-fit lg:h-[280px] overflow-hidden shadow-xl w-full">

                {/* Lado da Imagem */}
                <div className="">
                    <Image
                        src={genesisBackground}
                        alt="Banner de novidades"
                        priority
                        className="h-full w-full object-cover object-center lg:rounded-r-[20px]"
                    />
                </div>

                {/* Lado do Conteúdo */}
                <div className="relative flex flex-col justify-between flex-1 lg:px-8 px-5 lg:pb-6 pb-6 lg:pt-6 pt-6">
                    <div>
                        <div className="mb-3 lg:mb-4 w-fit">
                            <div className="flex items-center gap-2 bg-transparent text-[#737373] border border-[#737373] text-[10px] lg:text-xs font-medium px-3 py-1 rounded-full w-fit uppercase">
                                <Fire weight="fill" color="#891B1B" /> AO VIVO
                            </div>
                        </div>

                        <h3 className="text-[20px] lg:text-[22px] mb-1 font-semibold text-white">
                            Bom dia, dev!
                        </h3>

                        <p className="text-muted-foreground text-[14px] leading-relaxed max-w-[480px] line-clamp-2 lg:line-clamp-none">
                            Aprenda a programar do zero, partindo dos princípios da web até
                            criação de aplicações frontend e backend.
                        </p>
                    </div>

                    <div className="mt-4 lg:mt-0">
                        <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-5">
                            <div className="flex text-xs items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?v=4" />
                                    <AvatarFallback>JV</AvatarFallback>
                                </Avatar>
                                <p className="font-medium text-white">João Victor</p>
                            </div>
                            <div className="flex text-xs gap-2">
                                <p className="text-muted-foreground">Curso</p>
                                <p className="text-green-500 font-medium">Para Iniciantes</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Button className="bg-blue-gradient-500 text-white h-[40px] lg:h-[44px] rounded-full hover:opacity-90 border border-[#25252A] flex-1 sm:flex-none px-6 font-medium text-sm">
                                <TicketIcon size={18} weight="fill" className="mr-2" />
                                Retirar meu ingresso
                            </Button>
                            <Button className="h-[40px] lg:h-[44px] bg-[#1a1a1e] text-white rounded-full hover:bg-[#25252a] px-6 border border-[#25252A] text-sm">
                                <Plus size={18} className="mr-2" />
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}