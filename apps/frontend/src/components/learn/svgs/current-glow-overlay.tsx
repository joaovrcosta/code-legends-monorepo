"use client";

import React, { useId } from "react";

type Props = {
    size: number;
    intensity?: "soft" | "medium" | "strong";
};

export function CurrentGlowOverlay({ size, intensity = "medium" }: Props) {
    const uid = useId().replace(/:/g, "");
    const h = Math.round((size * 58) / 96);

    const glow = `glow-${uid}`;
    const inner = `inner-${uid}`;
    const beam = `beam-${uid}`;

    const cx = 48;
    const cy = 34.5;

    const params =
        intensity === "soft"
            ? { blur: 2.2, ringW: 4.0, a1: 0.75, a2: 0.45 }
            : intensity === "strong"
                ? { blur: 3.6, ringW: 5.6, a1: 0.95, a2: 0.65 }
                : { blur: 2.9, ringW: 4.8, a1: 0.9, a2: 0.55 };

    return (
        <svg
            width={size}
            height={h}
            viewBox="0 0 96 58"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            className="lp-current"
        >
            <defs>
                <filter id={glow} x="-40%" y="-80%" width="180%" height="220%">
                    <feGaussianBlur stdDeviation={params.blur} result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <radialGradient id={inner} cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                    <stop offset="35%" stopColor="rgba(230,220,255,0.65)" />
                    <stop offset="70%" stopColor="rgba(140,90,255,0.22)" />
                    <stop offset="100%" stopColor="rgba(140,90,255,0)" />
                </radialGradient>

                <linearGradient id={beam} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(190,160,255,0)" />
                    <stop offset="40%" stopColor="rgba(190,160,255,0.22)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>

                <filter id={`beamBlur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation={params.blur + 0.6} />
                </filter>
            </defs>

            {/* Feixe / luz saindo */}
            <path
                className="lp-beam"
                d={`M ${cx - 18} ${cy - 2} Q ${cx} ${cy - 38} ${cx + 18} ${cy - 2} Q ${cx} ${cy - 8} ${cx - 18} ${cy - 2} Z`}
                fill={`url(#${beam})`}
                filter={`url(#beamBlur-${uid})`}
                opacity={params.a2}
            />

            {/* Luz interna */}
            <ellipse
                className="lp-inner"
                cx={cx}
                cy={cy - 4}
                rx="22"
                ry="11"
                fill={`url(#${inner})`}
                filter={`url(#${glow})`}
                opacity={params.a1}
            />

            {/* Anel externo */}
            <g className="lp-ring">
                <ellipse
                    cx={cx}
                    cy={cy}
                    rx="41"
                    ry="15.2"
                    fill="none"
                    stroke="rgba(123,92,255,0.95)"
                    strokeWidth={params.ringW}
                    filter={`url(#${glow})`}
                />
                <ellipse
                    cx={cx}
                    cy={cy}
                    rx="34"
                    ry="12.7"
                    fill="none"
                    stroke="rgba(210,195,255,0.65)"
                    strokeWidth="2"
                    opacity="0.9"
                />
            </g>

            {/* CSS local (para você não ter que criar arquivo agora) */}
            <style>{`
        /* container do overlay */
        .lp-current {
          transform-origin: 50% 60%;
          animation: lpPulse 1.6s ease-in-out infinite;
        }

        /* anel pode rodar devagar (opcional) */
        .lp-ring {
          transform-origin: 50% 60%;
          animation: lpRotate 4.5s linear infinite;
        }

        /* luz interna "respira" */
        .lp-inner {
          animation: lpBreath 1.6s ease-in-out infinite;
        }

        /* feixe sobe e desce sutilmente */
        .lp-beam {
          transform-origin: 50% 60%;
          animation: lpBeam 1.6s ease-in-out infinite;
        }

        @keyframes lpPulse {
          0%   { transform: scale(0.98); opacity: 0.90; }
          50%  { transform: scale(1.03); opacity: 1.00; }
          100% { transform: scale(0.98); opacity: 0.90; }
        }

        @keyframes lpBreath {
          0%   { opacity: 0.55; }
          50%  { opacity: 0.95; }
          100% { opacity: 0.55; }
        }

        @keyframes lpBeam {
          0%   { transform: translateY(1px); opacity: 0.35; }
          50%  { transform: translateY(-1.5px); opacity: 0.55; }
          100% { transform: translateY(1px); opacity: 0.35; }
        }

        @keyframes lpRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Acessibilidade: respeita redução de movimento */
        @media (prefers-reduced-motion: reduce) {
          .lp-current, .lp-ring, .lp-inner, .lp-beam { animation: none !important; }
        }
      `}</style>
        </svg>
    );
}
