'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompactNumber } from '@/components/ui/compact-number'

type WeeklyXpCardProps = {
  days: { date: string; xp: number }[]
  totalXp?: number
}

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function weekdayLetterFromISODate(date: string) {
  const d = new Date(`${date}T00:00:00.000Z`)
  const letters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const idx = d.getUTCDay()
  return letters[idx] ?? '·'
}

export function WeeklyXpCard({ days, totalXp }: WeeklyXpCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const safeDays =
    days.length >= 7
      ? days.slice(0, 7)
      : [...days, ...Array.from({ length: Math.max(0, 7 - days.length) }, () => ({ date: '', xp: 0 }))]

  const v = safeDays.map((d) => d.xp)
  const max = Math.max(1, ...v)

  const w = 320
  const h = 120
  const padX = 20 // Aumentado levemente para não cortar o tooltip nas bordas
  const padY = 20
  const innerW = w - padX * 2
  const innerH = h - padY * 2

  const pts = v.map((val, idx) => {
    const x = padX + (innerW * idx) / (v.length - 1)
    const y = padY + innerH - (innerH * val) / max
    return { x, y, val, date: safeDays[idx].date }
  })

  const path = buildPath(pts)
  const total = typeof totalXp === 'number' ? totalXp : v.reduce((acc, n) => acc + n, 0)

  return (
    <div className="rounded-[20px] border border-[#25252A] bg-gray-gradient p-6 select-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">XP da semana</p>
        </div>
        <p className="text-xs font-semibold text-[#FF6200] tabular-nums">
          <CompactNumber value={total} suffix="xp" />
        </p>
      </div>

      <div className="relative mt-4 rounded-2xl border border-[#25252A] bg-[#141417] p-4">
        {/* Tooltip Flutuante */}
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-10 pointer-events-none"
              style={{
                left: pts[hoveredIdx].x,
                top: pts[hoveredIdx].y - 35,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="bg-[#FF6200] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {pts[hoveredIdx].val} XP
                {/* Triângulo do Tooltip */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FF6200] rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between text-[10px] font-semibold text-[#7e7e89]">
          <span>0</span>
          <span><CompactNumber value={Math.round(max / 2)} /></span>
          <span><CompactNumber value={max} /></span>
        </div>

        <div className="mt-3 relative">
          <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block overflow-visible">
            <defs>
              <linearGradient id="weeklyXpLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#FF6200" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#FF6200" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF6200" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Grid vertical */}
            {[0, 0.5, 1].map((pos) => (
              <line
                key={pos}
                x1={padX + (innerW * pos)} y1={padY}
                x2={padX + (innerW * pos)} y2={h - padY}
                stroke="#25252A" strokeDasharray="2 2"
              />
            ))}

            {/* Linha principal com animação de desenho */}
            <motion.path
              d={path}
              fill="none"
              stroke="url(#weeklyXpLine)"
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Pontos Interativos */}
            {pts.map((p, i) => (
              <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                {/* Área de detecção ampliada (invisível) */}
                <rect
                  x={p.x - 15}
                  y={0}
                  width={30}
                  height={h}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* O ponto visual */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 5 : 3.5}
                  fill={hoveredIdx === i ? "#fff" : "#FF6200"}
                  stroke="#FF6200"
                  strokeWidth={hoveredIdx === i ? 2 : 0}
                  animate={{
                    r: hoveredIdx === i ? 5 : 3.5,
                  }}
                  className="transition-colors duration-200"
                />
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-semibold text-[#7e7e89]">
          {safeDays.map((d, idx) => (
            <span
              key={`${d.date || 'x'}-${idx}`}
              className={`w-6 text-center transition-colors ${hoveredIdx === idx ? 'text-white' : ''}`}
            >
              {d.date ? weekdayLetterFromISODate(d.date) : '·'}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}