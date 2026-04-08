import { getCurrentUser } from '@/actions/user'
import { getMySkills } from '@/actions/user/get-my-skills'
import { SkillsTrackingCard } from '@/components/learn/skills-tracking-card'
import { WeeklyXpCard } from '@/components/learn/weekly-xp-card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarRingVariant,
} from '@/components/ui/avatar'
import { CompactNumber } from '@/components/ui/compact-number'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getUserFromAPI } from '@/actions/user/get-user-from-api'
import { getWeeklyXp } from '@/actions/user/get-weekly-xp'

function planToRingVariant(plan?: string): AvatarRingVariant {
  if (plan === 'PRO') return 'pro'
  if (plan === 'PREMIUM') return 'premium'
  return 'free'
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Minha jornada - Code Legends',
  description: 'Acompanhe seu progresso por skills e tecnologias.',
}

export default async function TrackingPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const userFromAPI = await getUserFromAPI()
  const weekly = await getWeeklyXp()
  const { skills } = await getMySkills()

  const totalXp =
    userFromAPI?.totalXp ?? user.totalXp ?? skills.reduce((acc, s) => acc + (s.xp ?? 0), 0)
  const level = userFromAPI?.level ?? user.level ?? 1
  const xpRemainingToNextLevel = userFromAPI?.xpToNextLevel ?? user.xpToNextLevel ?? 100
  const xpForNextLevel = totalXp + xpRemainingToNextLevel
  const offensive = 0

  return (
    <TooltipProvider delayDuration={250}>
      <div className="px-4 py-6 lg:px-12">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#7e7e89]">Minha jornada</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-[20px] border border-[#25252A] bg-gray-gradient p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  className="h-[52px] w-[52px] shrink-0"
                  ringVariant={planToRingVariant(userFromAPI?.plan ?? user.plan)}
                >
                  <AvatarImage src={userFromAPI?.avatar ?? user.avatar ?? ''} alt="" />
                  <AvatarFallback className="bg-[#25252A] text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {userFromAPI?.name ?? user.name}
                  </p>
                  <p className="mt-1 text-xs text-[#7e7e89]">Acompanhe seu progresso por skills</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-full border border-[#25252A] bg-[#141417] px-6 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7e7e89]">
                    XP Total
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Image src="/xp-icon.svg" alt="XP" width={11} height={20} />
                    <p className="text-lg font-semibold tabular-nums">
                      <CompactNumber
                        value={totalXp}
                        flameGradient
                        enableCountUp
                      />{' '}
                      <span className="text-[#7e7e89]">/</span>{' '}
                      <CompactNumber
                        value={xpForNextLevel}
                        className="text-[#7e7e89]"
                        tooltipOnlyWhenCompact={false}
                      />
                    </p>
                  </div>
                </div>

                <div className="rounded-full border border-[#25252A] bg-[#141417] px-6 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7e7e89]">
                    Nível geral
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#00C8FF] tabular-nums">
                    {level}
                  </p>
                </div>

                <div className="rounded-full border border-[#25252A] bg-[#141417] px-6 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7e7e89]">
                    Ofensivo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#00C8FF] tabular-nums">
                    {offensive}
                  </p>
                </div>
              </div>
            </div>

            <SkillsTrackingCard skills={skills} />
          </div>

          <div className="lg:sticky lg:top-[24px] h-fit">
            <WeeklyXpCard
              days={weekly?.days ?? []}
              totalXp={weekly?.totalXp}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
