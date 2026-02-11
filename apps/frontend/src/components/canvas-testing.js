"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ClickableGrayPlatform() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const [active, setActive] = useState(false);

    // Mantém referência do estado dentro do loop sem recriar o efeito
    const activeRef = useRef(active);
    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const wrap = canvas.parentElement;

        const lerp = (a, b, t) => a + (b - a) * t;

        function resize() {
            const rect = wrap.getBoundingClientRect();
            const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function drawPurpleOuterRing(cx, cy, t, rxBase, ryBase) {
            // Pulsação leve
            const p = Math.sin(t * 2.2) * 0.5 + 0.5; // 0..1
            const rx = rxBase + lerp(0, 6, p);
            const ry = ryBase + lerp(0, 3, p);

            // Glow externo
            ctx.save();
            ctx.globalAlpha = 0.65;
            ctx.shadowColor = "rgba(123,92,255,0.75)";
            ctx.shadowBlur = 18;
            ctx.strokeStyle = "rgba(123,92,255,0.95)";
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Segundo traço interno (ajuda a parecer com o print)
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.strokeStyle = "rgba(200,185,255,0.95)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx - 9, ry - 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        function drawGrayPlatform(cx, cy, t) {
            const rx = 96;
            const ry = 30;

            // leve "respiração" bem sutil
            const breathe = 1 + Math.sin(t * 1.2) * 0.004;

            // se ativo, desenha o anel roxo por fora (um pouco maior que o disco)
            if (activeRef.current) {
                drawPurpleOuterRing(cx, cy + 2, t, rx * 1.12, ry * 1.08);
            }

            // Base/sombra escura
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = "#8f8f8f";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 13, rx * 0.92 * breathe, ry * 0.62 * breathe, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Disco superior
            ctx.save();
            ctx.fillStyle = "#d6d6d6";
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx * breathe, ry * breathe, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Anel médio
            ctx.save();
            ctx.strokeStyle = "#a6a6a6";
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.ellipse(cx, cy, (rx - 12) * breathe, (ry - 5) * breathe, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Anel interno claro
            ctx.save();
            ctx.strokeStyle = "#eeeeee";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.ellipse(cx, cy, (rx - 30) * breathe, (ry - 14) * breathe, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Centro
            ctx.save();
            ctx.fillStyle = "#cfcfcf";
            ctx.beginPath();
            ctx.ellipse(cx, cy, (rx - 48) * breathe, (ry - 22) * breathe, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // brilho sutil no topo
            ctx.save();
            const glow = ctx.createRadialGradient(cx, cy - 8, 0, cx, cy - 8, rx);
            glow.addColorStop(0, "rgba(255,255,255,0.55)");
            glow.addColorStop(0.35, "rgba(255,255,255,0.18)");
            glow.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(cx, cy - 2, (rx - 18) * breathe, (ry - 10) * breathe, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        let start = performance.now();

        function frame(now) {
            const t = (now - start) / 1000;

            const w = wrap.getBoundingClientRect().width;
            const h = wrap.getBoundingClientRect().height;

            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;

            drawGrayPlatform(cx, cy, t);

            rafRef.current = requestAnimationFrame(frame);
        }

        resize();
        window.addEventListener("resize", resize);
        rafRef.current = requestAnimationFrame(frame);

        return () => {
            window.removeEventListener("resize", resize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div
            style={{
                width: 320,
                height: 220,
                borderRadius: 16,
                background: "transparent",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block", cursor: "pointer" }}
                onClick={() => setActive((v) => !v)}
                onPointerDown={(e) => {
                    // impede seleção/arrasto em mobile
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                }}
            />
        </div>
    );
}
