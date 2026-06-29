"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityCalendarProps {
    activities?: ActivityData[];
}

const SAO_PAULO_TZ = "America/Sao_Paulo";

/** 91 dias de atividade → 13 colunas semanais. */
const ACTIVITY_WEEK_COUNT = 13;

const activityCalendarRootClassName =
    "w-full font-sans select-none flex flex-col items-center";

const activityCalendarScrollClassName =
    "w-full overflow-x-auto scrollbar-hide py-2";

const activityCalendarGridWrapperClassName =
    "flex flex-col gap-2 w-max mx-auto lg:ml-auto lg:mr-0";

const activityCalendarMonthRowClassName =
    "flex text-[9px] font-bold h-4 ml-8";

const activityCalendarDayLabelsClassName =
    "flex flex-col justify-between text-[9px] font-medium py-[2px] h-[105px] sm:h-[130px] shrink-0";

const activityCalendarWeeksRowClassName = "flex gap-[5px] sm:gap-[6px]";

const activityCalendarWeekColumnClassName =
    "flex flex-col gap-[5px] sm:gap-[6px]";

const activityCellClassName =
    "box-border shrink-0 w-[13px] h-[13px] sm:w-[15px] sm:h-[14px] rounded-[4px]";

const activityCalendarLegendClassName =
    "w-full flex justify-center lg:justify-end mt-4 px-2 gap-2 text-[10px] text-[#525252] items-center leading-none";

function SkeletonCell() {
    return (
        <div
            className={`${activityCellClassName} bg-white/10 animate-pulse`}
            aria-hidden
        />
    );
}

function ActivityCalendarLegend() {
    return (
        <div className={activityCalendarLegendClassName}>
            <span>Menos</span>
            <div className="flex gap-[3px]">
                {[0, 1, 2, 3, 4].map((lvl) => (
                    <div
                        key={lvl}
                        className={`w-[10px] h-[10px] rounded-[2px] shrink-0 box-border bg-white/10 animate-pulse`}
                        aria-hidden
                    />
                ))}
            </div>
            <span>Mais</span>
        </div>
    );
}

export function ActivityCalendarSkeleton() {
    const weeks = Array.from({ length: ACTIVITY_WEEK_COUNT }, (_, i) => i);
    const days = Array.from({ length: 7 }, (_, i) => i);

    return (
        <div
            className={activityCalendarRootClassName}
            aria-busy
            aria-label="A carregar calendário de atividade"
        >
            <div className={activityCalendarScrollClassName}>
                <div className={activityCalendarGridWrapperClassName}>
                    <div className={`${activityCalendarMonthRowClassName} text-transparent`}>
                        {weeks.map((wi) => (
                            <div key={wi} className="relative w-full">
                                {wi % 4 === 0 ? (
                                    <span className="absolute left-0 top-0 inline-block h-[10px] w-[26px] rounded-sm bg-white/10 animate-pulse sm:w-[30px]" />
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <div
                            className={`${activityCalendarDayLabelsClassName} text-transparent`}
                        >
                            <span className="inline-block h-[10px] w-[22px] rounded-sm bg-white/10 animate-pulse">
                                Seg
                            </span>
                            <span className="inline-block h-[10px] w-[26px] rounded-sm bg-white/10 animate-pulse">
                                Qua
                            </span>
                            <span className="inline-block h-[10px] w-[22px] rounded-sm bg-white/10 animate-pulse">
                                Sex
                            </span>
                        </div>

                        <div className={activityCalendarWeeksRowClassName}>
                            {weeks.map((weekIndex) => (
                                <div
                                    key={weekIndex}
                                    className={activityCalendarWeekColumnClassName}
                                >
                                    {days.map((dayIndex) => (
                                        <SkeletonCell
                                            key={`${weekIndex}-${dayIndex}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ActivityCalendarLegend />
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollToRight = () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft =
                    scrollContainerRef.current.scrollWidth;
            }
        };

        scrollToRight();
        const timer = window.setTimeout(scrollToRight, 100);
        return () => window.clearTimeout(timer);
    }, [activities]);

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
                isFirstDayOfMonth: dom === 1,
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

    if (activities == null) {
        return <ActivityCalendarSkeleton />;
    }

    return (
        <div className={activityCalendarRootClassName}>
            <div
                ref={scrollContainerRef}
                className={activityCalendarScrollClassName}
            >
                <div className={activityCalendarGridWrapperClassName}>
                    <div
                        className={`${activityCalendarMonthRowClassName} text-[#737373]`}
                    >
                        {weeks.map((week, i) => {
                            const showLabel =
                                i === 0 || week.some((d) => d.isFirstDayOfMonth);
                            if (showLabel) {
                                const monthLabel =
                                    week.find((d) => d.isFirstDayOfMonth)?.month ||
                                    week[0].month;
                                return (
                                    <div key={i} className="relative w-full">
                                        <span className="absolute left-0 whitespace-nowrap">
                                            {monthLabel}
                                        </span>
                                    </div>
                                );
                            }
                            return <div key={i} className="w-full" />;
                        })}
                    </div>

                    <div className="flex gap-3">
                        <div
                            className={`${activityCalendarDayLabelsClassName} text-[#525252]`}
                        >
                            <span>Seg</span>
                            <span>Qua</span>
                            <span>Sex</span>
                        </div>

                        <div className={activityCalendarWeeksRowClassName}>
                            {weeks.map((week, weekIndex) => (
                                <div
                                    key={weekIndex}
                                    className={activityCalendarWeekColumnClassName}
                                >
                                    {week.map((day) => (
                                        <div
                                            key={day.date}
                                            className={`${activityCellClassName} transition-all ${getActivityColor(day.count)} hover:ring-1 hover:ring-white/40 cursor-pointer`}
                                            title={`${day.date}: ${day.count} ${day.count === 1 ? "aula" : "aulas"}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={activityCalendarLegendClassName}>
                <span>Menos</span>
                <div className="flex gap-[3px]">
                    {[0, 1, 2, 3, 4].map((lvl) => (
                        <div
                            key={lvl}
                            className={`w-[10px] h-[10px] rounded-[2px] shrink-0 box-border ${getActivityColor(lvl)}`}
                        />
                    ))}
                </div>
                <span>Mais</span>
            </div>
        </div>
    );
}
