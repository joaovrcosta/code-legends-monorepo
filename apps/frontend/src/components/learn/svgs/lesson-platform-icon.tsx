"use client";

import React, { useId, useMemo } from "react";
import { PLATFORM_COMPLETED_SVG } from "@/components/learn/svgs/platform-completed";
import { PLATFORM_DEFAULT_SVG } from "@/components/learn/svgs/platform-default";
import { prefixSvgIds } from "@/components/learn/svgs/svg-id-prefix";

type Props = {
    size?: number;        // largura em px
    completed?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

export function LessonPlatformIcon({
    size = 90,
    completed = false,
    disabled = false,
    className,
    style,
}: Props) {
    const uid = useId().replace(/:/g, "");
    const svgRaw = completed ? PLATFORM_COMPLETED_SVG : PLATFORM_DEFAULT_SVG;

    const svg = useMemo(() => prefixSvgIds(svgRaw, `lp-${uid}`), [svgRaw, uid]);

    // proporção: ambos têm height 58; widths 97 e 96
    const baseW = completed ? 97 : 96;
    // const height = Math.round((size * 58) / baseW);

    return (
        <span
            className={className}
            style={{
                display: "inline-block",
                opacity: disabled ? 0.55 : 1,
                ...style,
            }}
            // ok porque SVG é estático do seu código
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
