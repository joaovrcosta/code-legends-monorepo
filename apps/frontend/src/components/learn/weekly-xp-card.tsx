'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompactNumber } from '@/components/ui/compact-number'

type WeeklyXpCardProps = {
  days: { date: string; xp: number }[]
  totalXp?: number
  playerName?: string // Adicionado para seguir o estilo da foto
}

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

const SAO_PAULO_TZ = 'America/Sao_Paulo'

function weekdayLetterFromISODate(date: string) {
  if (!date) return '·'
  // Importante: `YYYY-MM-DDT00:00:00Z` pode "voltar" um dia no fuso de São Paulo.
  // Usar meio-dia UTC evita o shift de dia/weekday.
  const instant = new Date(`${date}T12:00:00.000Z`)
  if (Number.isNaN(instant.getTime())) return '·'

  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: SAO_PAULO_TZ,
    weekday: 'short',
  })
    .formatToParts(instant)
    .find((p) => p.type === 'weekday')?.value

  const toIdx: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  const idx = wd !== undefined ? toIdx[wd] : undefined
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
  return idx !== undefined ? (labels[idx] ?? '·') : '·'
}

export function WeeklyXpCard({ days, totalXp, playerName = "Você" }: WeeklyXpCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const safeDays =
    days.length >= 7
      ? days.slice(0, 7)
      : [...days, ...Array.from({ length: Math.max(0, 7 - days.length) }, () => ({ date: '', xp: 0 }))]

  const values = safeDays.map((d) => d.xp)
  const maxXP = Math.max(100, ...values) // Mínimo de 100 para o gráfico não ficar vazio

  // Define os 5 níveis do eixo Y (como na foto: 0, 25%, 50%, 75%, 100%)
  const yAxisLevels = [
    maxXP,
    Math.round(maxXP * 0.75),
    Math.round(maxXP * 0.5),
    Math.round(maxXP * 0.25),
    0
  ]

  const w = 400
  const h = 200
  const labelWidth = 40 // Espaço para os números da esquerda
  const padBottom = 30 // Espaço para as letras dos dias
  const padTop = 20
  const padRight = 10

  const innerW = w - labelWidth - padRight
  const innerH = h - padTop - padBottom

  const pts = values.map((val, idx) => {
    const x = labelWidth + (innerW * idx) / (values.length - 1)
    const y = padTop + innerH - (innerH * val) / maxXP
    return { x, y, val }
  })

  const path = buildPath(pts)
  const total = typeof totalXp === 'number' ? totalXp : values.reduce((acc, n) => acc + n, 0)

  return (
    <div className="rounded-[20px] bg-transparent p-6 select-none font-sans w-full max-w-none">
      {/* Header Estilo Foto */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00C8FF]" />
          <span className="text-sm font-bold text-white tracking-tight">{playerName}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-white tabular-nums">
            <CompactNumber value={total} /> XP
          </span>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-10 pointer-events-none px-2 py-1 bg-[#00C8FF] text-white text-[10px] font-bold rounded shadow-xl"
              style={{
                left: pts[hoveredIdx].x,
                top: pts[hoveredIdx].y - 30,
                transform: 'translateX(-50%)',
              }}
            >
              {pts[hoveredIdx].val} XP
            </motion.div>
          )}
        </AnimatePresence>

        <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block overflow-visible">
          {yAxisLevels.map((val, i) => {
            const yPos = padTop + (innerH * i) / (yAxisLevels.length - 1)
            return (
              <g key={`grid-${i}`}>
                <text
                  x="0"
                  y={yPos + 4}
                  className="fill-[#5e5e66] text-[11px] font-bold"
                >
                  {val}
                </text>
                <line
                  x1={labelWidth}
                  y1={yPos}
                  x2={w - padRight}
                  y2={yPos}
                  stroke="#25252A"
                  strokeWidth="1.5"
                />
              </g>
            )
          })}

          <motion.path
            d={path}
            fill="none"
            stroke="#00C8FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 200, 255, 0.22))' }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {pts.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={p.x - 20}
                y={0}
                width={40}
                height={h}
                fill="transparent"
              />

              <motion.circle
                cx={p.x}
                cy={p.y}
                // Aumentamos o raio base de 4 para 8, e o de hover de 5 para 12
                r={hoveredIdx === i ? 12 : 8}
                fill={hoveredIdx === i ? "#fff" : "#00C8FF"}
                stroke="#111114"
                // Aumentar o strokeWidth ajuda a destacar o círculo maior
                strokeWidth="2"
                animate={{
                  // O scale pode ser mantido em 1 ou levemente aumentado para um efeito suave
                  scale: hoveredIdx === i ? 1.1 : 1
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />

              <text
                x={p.x}
                y={h - 5}
                textAnchor="middle"
                className={`text-[11px] font-bold transition-colors duration-200 ${hoveredIdx === i ? 'fill-white' : 'fill-[#5e5e66]'
                  }`}
              >
                {safeDays[i].date ? weekdayLetterFromISODate(safeDays[i].date) : '·'}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}