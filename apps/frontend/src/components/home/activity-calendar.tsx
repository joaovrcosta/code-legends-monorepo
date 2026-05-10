"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityCalendarProps {
    activities?: ActivityData[];
}

const SAO_PAULO_TZ = "America/Sao_Paulo";

/** Alinhado ao grid carregado: 91 dias → 13 colunas × 7 linhas (mesmas gaps/medidas do calendário real). */
const SKELETON_WEEK_COUNT = 13;

function ActivityCalendarSkeleton() {
    const weeks = Array.from({ length: SKELETON_WEEK_COUNT }, (_, i) => i);
    const days = Array.from({ length: 7 }, (_, i) => i);

    return (
        <div
            className="w-full font-sans select-none flex flex-col items-center"
            aria-busy
            aria-label="A carregar calendário de atividade"
        >
            <div className="w-full overflow-x-auto scrollbar-hide py-2">
                <div className="flex flex-col gap-2 w-max mx-auto lg:ml-auto lg:mr-0">
                    {/* Rótulos dos meses — placeholders alinhados às colunas */}
                    <div className="flex ml-8 gap-[5px] sm:gap-[6px] h-4 items-end shrink-0">
                        {weeks.map((wi) => (
                            <div
                                key={wi}
                                className="relative flex w-[13px] shrink-0 flex-col justify-end sm:w-[15px]"
                            >
                                {wi % 4 === 0 ? (
                                    <Skeleton className="h-2.5 w-7 rounded-sm sm:w-8" />
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {/* Dias da semana — só barras, sem texto */}
                        <div className="flex h-[105px] w-8 shrink-0 flex-col justify-between py-[2px] sm:h-[130px]">
                            <Skeleton className="h-2 w-7 rounded-sm" />
                            <Skeleton className="h-2 w-8 rounded-sm" />
                            <Skeleton className="h-2 w-7 rounded-sm" />
                        </div>

                        <div className="flex gap-[5px] sm:gap-[6px]">
                            {weeks.map((weekIndex) => (
                                <div
                                    key={weekIndex}
                                    className="flex flex-col gap-[5px] sm:gap-[6px]"
                                >
                                    {days.map((dayIndex) => (
                                        <Skeleton
                                            key={`${weekIndex}-${dayIndex}`}
                                            className="h-[13px] w-[13px] rounded-[4px] sm:h-[14px] sm:w-[15px]"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legenda — Menos / escala / Mais */}
            <div className="mt-4 flex w-full items-center justify-center gap-2 px-2 lg:justify-end">
                <Skeleton className="h-3 w-10 rounded-sm" />
                <div className="flex gap-[3px]">
                    {Array.from({ length: 5 }, (_, lvl) => (
                        <Skeleton
                            key={lvl}
                            className="h-[10px] w-[10px] rounded-[2px]"
                        />
                    ))}
                </div>
                <Skeleton className="h-3 w-9 rounded-sm" />
            </div>
        </div>
    );
}

function formatYYYYMMDDInTZ(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (!y || !m || !d) return "";
    return `${y}-${m}-${d}`;
}

function dayOfMonthInTZ(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        day: "2-digit",
    }).formatToParts(date);
    const d = parts.find((p) => p.type === "day")?.value;
    const n = d ? Number(d) : NaN;
    return Number.isFinite(n) ? n : null;
}

function monthLabelInTZ(date: Date, timeZone: string) {
    return date
        .toLocaleDateString("pt-BR", { month: "short", timeZone })
        .toUpperCase()
        .replace(".", "");
}

function addDaysUTCNoon(base: Date, days: number) {
    const d = new Date(base.getTime());
    // Meio-dia UTC evita shift de dia no fuso local
    d.setUTCHours(12, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

function getActivityColor(count: number): string {
    if (count === 0) return "bg-[#212124]";
    if (count === 1) return "bg-[#004B63]";
    if (count === 2) return "bg-[#007EA3]";
    if (count === 3) return "bg-[#00B4D8]";
    return "bg-[#00C8FF]";
}

export function ActivityCalendar({ activities }: ActivityCalendarProps) {
    const [isMounted, setIsMounted] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        if (isMounted) {
            const scrollToRight = () => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
                }
            };
            scrollToRight();
            const timer = setTimeout(scrollToRight, 100);
            return () => clearTimeout(timer);
        }
    }, [isMounted]);

    const dataMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const a of activities ?? []) {
            if (!a?.date) continue;
            map.set(a.date, a.count ?? 0);
        }
        return map;
    }, [activities]);

    const activityGrid = useMemo(() => {
        const days = [];
        const todayNoonUTC = addDaysUTCNoon(new Date(), 0);

        for (let i = 90; i >= 0; i--) {
            const date = addDaysUTCNoon(todayNoonUTC, -i);
            const dateStr = formatYYYYMMDDInTZ(date, SAO_PAULO_TZ);
            const dom = dayOfMonthInTZ(date, SAO_PAULO_TZ);

            days.push({
                date: dateStr,
                count: dataMap.get(dateStr) ?? 0,
                month: monthLabelInTZ(date, SAO_PAULO_TZ),
                isFirstDayOfMonth: dom === 1
            });
        }
        return days;
    }, [dataMap]);

    const weeks = useMemo(() => {
        const cols = [];
        for (let i = 0; i < activityGrid.length; i += 7) {
            cols.push(activityGrid.slice(i, i + 7));
        }
        return cols;
    }, [activityGrid]);

    if (!isMounted || activities == null) return <ActivityCalendarSkeleton />;

    return (
        <div className="w-full font-sans select-none flex flex-col items-center">
            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto scrollbar-hide py-2"
            >
                {/* mx-auto centraliza; gap-4 no mobile dá mais respiro lateral */}
                <div className="flex flex-col gap-2 w-max mx-auto lg:ml-auto lg:mr-0">

                    <div className="flex text-[9px] font-bold text-[#737373] h-4 ml-8">
                        {weeks.map((week, i) => {
                            const showLabel = i === 0 || week.some(d => d.isFirstDayOfMonth);
                            if (showLabel) {
                                const monthLabel = week.find(d => d.isFirstDayOfMonth)?.month || week[0].month;
                                return (
                                    <div key={i} className="relative w-full">
                                        <span className="absolute left-0 whitespace-nowrap">{monthLabel}</span>
                                    </div>
                                );
                            }
                            return <div key={i} className="w-full" />;
                        })}
                    </div>

                    <div className="flex gap-3">
                        {/* Ajuste de altura responsiva para acompanhar o aumento dos quadrados */}
                        <div className="flex flex-col justify-between text-[9px] font-medium text-[#525252] py-[2px] h-[105px] sm:h-[130px]">
                            <span>Seg</span>
                            <span>Qua</span>
                            <span>Sex</span>
                        </div>

                        {/* Aumentado: w/h de 11px para 13px no mobile */}
                        <div className="flex gap-[5px] sm:gap-[6px]">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-[5px] sm:gap-[6px]">
                                    {week.map((day) => (
                                        <div
                                            key={day.date}
                                            className={`
                                                w-[13px] h-[13px] 
                                                sm:w-[15px] sm:h-[14px] 
                                                rounded-[4px] transition-all 
                                                ${getActivityColor(day.count)}
                                                hover:ring-1 hover:ring-white/40 cursor-pointer
                                            `}
                                            title={`${day.date}: ${day.count} ${day.count === 1 ? "aula" : "aulas"}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-center lg:justify-end mt-4 px-2 gap-2 text-[10px] text-[#525252]">
                <span>Menos</span>
                <div className="flex gap-[3px]">
                    {[0, 1, 2, 3, 4].map((lvl) => (
                        <div key={lvl} className={`w-[10px] h-[10px] rounded-[2px] ${getActivityColor(lvl)}`} />
                    ))}
                </div>
                <span>Mais</span>
            </div>
        </div>
    );
}