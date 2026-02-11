"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityCalendarProps {
    activities?: ActivityData[];
}

const generateMockActivities = (): ActivityData[] => {
    const data: ActivityData[] = [];
    const today = new Date();
    for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const random = Math.random();
        data.push({ date: dateStr, count: random > 0.6 ? Math.floor(random * 5) : 0 });
    }
    return data;
};

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

    const activityData = useMemo(() =>
        activities && activities.length > 0 ? activities : generateMockActivities(),
        [activities]);

    const activityGrid = useMemo(() => {
        const days = [];
        const dataMap = new Map(activityData.map((a) => [a.date, a.count]));

        for (let i = 90; i >= 0; i--) {
            const date = new Date();
            date.setDate(new Date().getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            days.push({
                date: dateStr,
                count: dataMap.get(dateStr) ?? 0,
                month: date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", ""),
                isFirstDayOfMonth: date.getDate() === 1
            });
        }
        return days;
    }, [activityData]);

    const weeks = useMemo(() => {
        const cols = [];
        for (let i = 0; i < activityGrid.length; i += 7) {
            cols.push(activityGrid.slice(i, i + 7));
        }
        return cols;
    }, [activityGrid]);

    if (!isMounted) return <div className="h-[140px] w-full bg-[#1a1a1e]/50 rounded-xl animate-pulse" />;

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
                                            title={`${day.date}: ${day.count} aulas`}
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