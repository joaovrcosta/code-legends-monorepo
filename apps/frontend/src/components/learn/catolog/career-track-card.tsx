'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import courseCover from '../../../../public/course-cover.jpeg'
import { LevelBars } from '@/components/course/level-bars'

export type CareerTrackCardProps = {
  title: string
  href: string
  badge?: string
  pills?: string[]
  level?: string
  className?: string
}

export function CareerTrackCard({
  title,
  href,
  badge = 'Para assinantes',
  pills = [],
  level,
  className,
}: CareerTrackCardProps) {
  return (
    <Link
      href={href}
      className={[
        'group relative block h-full w-full overflow-hidden rounded-[16px] border border-[#25252A] bg-gray-gradient shadow-2xl',
        ' md:hover:border-[#3f3f48]',
        className ?? '',
      ].join(' ')}
    >
      <div className="absolute inset-0">
        <Image
          src={courseCover}
          alt=""
          fill
          priority={false}
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Image src={"https://xesque.rocketseat.dev/platform/1760965821149.svg"} alt="Trilha de carreira" width={80} height={80} />
          {badge ? (
            <div className="shrink-0 rounded-full border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-orange-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-purple-300">
              {badge}
            </div>
          ) : null}
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2 ml-4 mt-4">
            <div className="text-3xl font-semibold text-white">{title}</div>
            <ArrowUpRight className="h-5 w-5 text-white/80 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>


          {/* 
          <div className="mt-4 h-px w-full bg-white/10" /> */}

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-300">
            <div className="flex items-center gap-2 text-xs text-[#a5a5a6] ml-4">
              FORMAÇÃO 181h • 2026
            </div>
            <div className="font-semibold text-amber-300">JS</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

