import { cn } from "@/lib/utils";

export function LevelBars({ level, isSmall }: { level?: string; isSmall?: boolean }) {
    const lvl = level?.toUpperCase() || "";

    const isBeginner = lvl === 'INICIANTE';
    const isIntermediate = lvl === 'INTERMEDIARIO' || lvl === 'INTERMEDIÁRIO';
    const isAdvanced = lvl === 'AVANCADO' || lvl === 'AVANÇADO';

    const getLevelText = () => {
        if (isBeginner) return "Para iniciantes";
        if (isIntermediate) return "Para intermediários";
        if (isAdvanced) return "Para avançados";
        return level;
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-end gap-[3px] h-[16px] w-[20px] mb-[2px] shrink-0">
                <div
                    className={cn(
                        "w-[4px] rounded-full transition-all duration-500 h-[40%]",
                        (isBeginner || isIntermediate || isAdvanced)
                            ? "bg-[#00b4d8] shadow-[0_0_8px_#00ffa366]"
                            : "bg-[#25252A]"
                    )}
                />
                <div
                    className={cn(
                        "w-[4px] rounded-full transition-all duration-500 h-[70%]",
                        (isIntermediate || isAdvanced)
                            ? "bg-[#00b4d8] shadow-[0_0_8px_#00ffa366]"
                            : "bg-[#25252A]"
                    )}
                />
                <div
                    className={cn(
                        "w-[4px] rounded-full transition-all duration-500 h-[100%]",
                        isAdvanced
                            ? "bg-[#00b4d8] shadow-[0_0_8px_#00ffa366]"
                            : "bg-[#25252A]"
                    )}
                />
            </div>

            <p className={cn(
                "font-base text-[#a5a5a6] transition-colors duration-300",
                isSmall ? "text-xs" : "text-sm"
            )}>
                {getLevelText()}
            </p>
        </div>
    );
}