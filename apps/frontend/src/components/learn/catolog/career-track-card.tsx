'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import courseCover from '../../../../public/course-cover.jpeg'


export type CareerTrackCardProps = {
  title: string
  href: string
  badge?: string
  pills?: string[]
  level?: string
  className?: string
  /** URL externa (SVG/PNG); se ausente, usa ilustração padrão */
  iconUrl?: string | null
}

const DEFAULT_TRACK_ILLUSTRATION =
  'https://xesque.rocketseat.dev/platform/1760965821149.svg'

export function CareerTrackCard({
  title,
  href,
  badge = 'Para assinantes',
  pills = [],
  level,
  className,
  iconUrl,
}: CareerTrackCardProps) {
  return (
    <Link
      href={href}
      className={[
        'group relative block h-[247px] w-full overflow-hidden rounded-[16px] border border-[#25252A] bg-gray-gradient shadow-2xl',
        'md:hover:border-[#3f3f48]',
        className ?? '',
      ].join(' ')}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={courseCover}
          alt=""
          fill
          priority={false}
          className="object-cover opacity-55"
        />

        {/* Gradiente lateral */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0d]/70 via-[#0c0c0d]/35 to-[#0c0c0d]/10" />

        {/* Fade de baixo para cima */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-[#0c0c0d]/30 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconUrl}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 object-contain"
            />
          ) : (
            <Image
              src={DEFAULT_TRACK_ILLUSTRATION}
              alt="Trilha de carreira"
              width={80}
              height={80}
              unoptimized
            />
          )}

          {badge ? (
            <div className="shrink-0 rounded-full border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-orange-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-purple-300">
              {badge}
            </div>
          ) : null}
        </div>

        <div className="mt-auto">
          <div className="ml-4 mt-4 flex items-center gap-2">
            <div className="text-3xl font-semibold text-white">
              {title}
            </div>
            <ArrowUpRight className="h-5 w-5 text-white/80 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-300">
            <div className="ml-4 flex items-center gap-2 text-xs text-[#a5a5a6]">
              Formação • 181h • 2026
            </div>
            <div>
              <div className="font-semibold text-amber-300 flex items-center">
                <Image src="https://xesque.rocketseat.dev/platform/1724859305154.svg" width={24} height={24} alt="" />
                <Image src="https://xesque.rocketseat.dev/platform/1724859367235.svg" width={24} height={24} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}