import Link from "next/link";
import { Progress } from "../ui/progress";
import { ActivityCalendar } from "./activity-calendar";
import { CaretRight, Flame, Lightning } from "@phosphor-icons/react/dist/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getCurrentUser } from "@/actions/user/get-current-user";

export async function UserProfiler() {
    const user = await getCurrentUser();
    const firstName = user?.name?.split(" ")[0] || "Usuário";
    const progress = 82;

    return (
        <div className="w-full lg:mb-0 mb-6 lg:max-w-[360px] flex-shrink-0 self-stretch lg:mt-9 mt-0 flex flex-col gap-8 lg:sticky lg:top-[32px] h-fit">
            <div className="bg-[#1A1A1E] p-6 border border-[#25252A] rounded-[20px] w-full">
                <div className=" flex justify-between">
                    <h1 className="text-white text-xl font-medium">Olá, {firstName}</h1>
                    <div className="flex items-center gap-2">
                        <Lightning size={24} weight="fill" className="text-[#FF6200]" />
                        PRO
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                    {/* Avatar com borda gradiente */}
                    <div className="relative flex-shrink-0">
                        <div
                            className="p-[4px] rounded-full"
                            style={{
                                background: "linear-gradient(135deg, #00D9FF 0%, #00C8FF 25%, #7B61FF 50%, #A855F7 75%, #00D9FF 100%)"
                            }}
                        >
                            <div className="bg-[#1A1A1E] rounded-full p-[6px]">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={user?.avatar || undefined} />
                                    <AvatarFallback className="bg-[#25252A] text-white text-lg font-semibold">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>

                    {/* Botão Meu perfil */}
                    <Link href="/account" className="flex-1">
                        <button className="w-full h-[44px] bg-transparent border border-[#25252a] hover:opacity-90 hover:bg-[#25252a] transition-all rounded-[12px] text-white font-medium text-sm flex items-center justify-center">
                            Meu perfil
                        </button>
                    </Link>
                </div>
                <div className="mt-6">
                    <div>
                        <p className="text-white text-sm font-medium">Nível 122</p>
                    </div>
                    <div className="mt-2">
                        <div className="flex items-center gap-4 w-full">
                            <Progress
                                value={progress}
                                className="w-full bg-[#25252A] h-[2px]"
                            />
                            <p className="text-sm text-center text-white">
                                {Math.round(progress)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 w-full overflow-x-auto scrollbar-hide py-2">
                        <div className="min-w-fit flex justify-center">
                            <ActivityCalendar />
                        </div>
                    </div>
                    <div className="mt-6">
                        <Link
                            href="/learn/badges"
                            className="flex items-center justify-between py-4 border-b border-[#25252A] hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <span className="text-[#C4C4CC] text-sm font-medium">
                                Ver Meus Emblemas
                            </span>
                            <CaretRight size={16} className="text-[#C4C4CC]" weight="regular" />
                        </Link>
                        <Link
                            href="/learn/tracking"
                            className="flex items-center justify-between py-4 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <span className="text-[#C4C4CC] text-sm font-medium">
                                Ver Meu Progresso
                            </span>
                            <CaretRight size={16} className="text-[#C4C4CC]" weight="regular" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="bg-[#1A1A1E] border border-[#25252A] rounded-[20px] w-full p-6">
                <div className="flex items-center gap-2 mb-2">
                    <Flame size={24} weight="fill" className="text-[#FF6200]" />
                    <span className="text-white text-lg font-semibold">Streak</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">0</span>
                    <span className="text-sm text-[#C4C4CC]">dias</span>
                </div>
                <p className="text-xs text-[#737373] mt-2">
                    Assista uma aula para aumentar seu streak
                </p>
            </div>
        </div>
    );
}