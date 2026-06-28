'use client'

import Image from 'next/image'
import Link from 'next/link'
import courseCover from '../../../../public/course-cover.jpeg'
import { SubscriberBadge } from '@/components/ui/subscriber-badge'

export type CareerTrackCardProps = {
  title: string
  href: string
  badgeVariant?: 'exclusive' | 'premium' | null
  pills?: string[]
  level?: string
  className?: string
  iconUrl?: string | null
  thumbnailUrl?: string | null
  colorHex?: string | null
  modulesCount?: number
}

const DEFAULT_TRACK_ILLUSTRATION =
  'https://xesque.rocketseat.dev/platform/1760965821149.svg'

const TECH_ICONS = [
  'https://xesque.rocketseat.dev/platform/1724859305154.svg',
  'https://xesque.rocketseat.dev/platform/1724859367235.svg',
]

const CARD_FADE =
  'linear-gradient(to top, #0c0c0d 0%, #0c0c0d 26%, rgba(10,10,10,0.96) 34%, rgba(10,10,10,0.72) 42%, rgba(10,10,10,0.28) 48%, transparent 54%)'

export function CareerTrackCard({
  title,
  href,
  badgeVariant = 'premium',
  pills = [],
  className,
  iconUrl,
  thumbnailUrl,
}: CareerTrackCardProps) {
  const subtitle =
    pills.length > 0 ? pills.join(' - ') : 'Formação - 18h - 2026'

  return (
    <Link
      href={href}
      className={[
        'group relative block h-[420px] w-full max-w-full overflow-hidden rounded-[20px] bg-[#0a0a0a] border border-[#2a2a2e] shadow-sm isolate',
        'md:hover:border-[#3f3f48]',
        className ?? '',
      ].join(' ')}
    >
      <div className="absolute inset-0">
        <Image
          src={thumbnailUrl || courseCover}
          alt=""
          fill
          priority={false}
          unoptimized={Boolean(thumbnailUrl?.startsWith('http'))}
          className="object-cover object-[center_20%] rounded-[20px]"
        />
        <div className="absolute inset-0 bg-[#1a1033]/25" />
        <div
          className="absolute inset-0"
          style={{ background: CARD_FADE }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-orange-400/50 via-amber-400/30 to-purple-500/20 blur-md"
            />
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt=""
                width={64}
                height={64}
                className="relative h-16 w-16 rounded-full object-contain"
              />
            ) : (
              <Image
                src={DEFAULT_TRACK_ILLUSTRATION}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="relative h-16 w-16 rounded-full object-contain"
              />
            )}
          </div>

          {badgeVariant ? (
            <SubscriberBadge variant={badgeVariant} size="sm" />
          ) : null}
        </div>

        <div className="mt-auto">
          <h3 className="text-2xl font-semibold leading-tight text-white">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="inline-flex min-h-[42px] max-w-[200px] flex-1 items-center justify-center rounded-full border border-[#2a2a2e] bg-[#131315] px-5 text-sm font-bold text-white transition-colors group-hover:border-zinc-500 group-hover:bg-[#1a1a1d]">
              Conhecer
            </span>
            <div className="flex shrink-0 items-center gap-0.5">
              {TECH_ICONS.map((src) => (
                <Image
                  key={src}
                  src={src}
                  width={24}
                  height={24}
                  alt=""
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
