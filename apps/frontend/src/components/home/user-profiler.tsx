import { UserPlan } from '@code-legends/shared-types'
import Link from 'next/link'
import { Progress } from '../ui/progress'
import { ActivityCalendar } from './activity-calendar'
import { CaretRight, Flame } from '@phosphor-icons/react/dist/ssr'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarRingVariant,
} from '../ui/avatar'
import { getCurrentUser } from '@/actions/user/get-current-user'
import { getUserFromAPI, getResolvedUserPlan } from '@/actions/user/get-user-from-api'
import { getMySkills } from '@/actions/user/get-my-skills'
import { getLessonActivity } from '@/actions/user/get-lesson-activity'
import { getStreak } from '@/actions/user/get-streak'
import { hasPaidPlan } from '@/lib/user-plan'
import { CompactNumber } from '@/components/ui/compact-number'
import { CtaFacaUpgradeCard } from '@/components/cta'
import { UserPlanSubscriberBadge } from '@/components/ui/subscriber-badge'
import Image from 'next/image'

export async function UserProfiler() {
  const [user, userFromAPI, userPlan, { skills }, lessonActivity, streak] = await Promise.all([
    getCurrentUser(),
    getUserFromAPI(),
    getResolvedUserPlan(),
    getMySkills(),
    getLessonActivity({ days: 98 }),
    getStreak(),
  ])
  const firstName = user?.name?.split(' ')[0] || 'Usuário'

  const level = userFromAPI?.level ?? user?.level ?? 1
  const xpRemainingToNextLevel =
    userFromAPI?.xpToNextLevel ?? user?.xpToNextLevel ?? 100

  const totalXp =
    userFromAPI?.totalXp ??
    user?.totalXp ??
    skills.reduce((acc, s) => acc + (s.xp ?? 0), 0)
  const xpForNextLevel = totalXp + xpRemainingToNextLevel
  const progress =
    xpForNextLevel > 0
      ? Math.max(0, Math.min(100, (totalXp / xpForNextLevel) * 100))
      : 0

  const avatarRingVariant: AvatarRingVariant =
    userPlan === UserPlan.PRO
      ? 'pro'
      : userPlan === UserPlan.PREMIUM
        ? 'premium'
        : 'free'

  return (
    <div className="relative z-10 w-full lg:mb-0 mb-6 lg:max-w-[360px] flex-shrink-0 self-stretch lg:mt-9 mt-0 flex flex-col gap-8 lg:sticky lg:top-[32px] h-fit">
      <div className="bg-surface-2 p-6 border border-[#25252A] rounded-[20px] w-full">
        <div className=" flex justify-between">
          <h1 className="text-white text-xl font-medium">Olá, {firstName}</h1>
          <UserPlanSubscriberBadge />
        </div>
        <div className="flex items-center gap-4 mt-6">
          {/* Avatar com anel na cor do plano */}
          <Avatar ringVariant={avatarRingVariant} className="h-16 w-16">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-[#25252A] text-white text-lg font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Botão Meu perfil */}
          <Link href="/account" className="flex-1">
            <button className="w-full h-[44px] bg-transparent border border-[#25252a] hover:opacity-90 hover:bg-[#25252a] transition-all rounded-full text-white font-medium text-sm flex items-center justify-center">
              Meu perfil
            </button>
          </Link>
        </div>
        <div className="mt-6">
          <div>
            <div>
              <p className="text-white text-sm font-medium">Nível {level}</p>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-4 w-full">
                <Progress
                  value={progress}
                  className="w-full bg-[#25252A] h-[2px]"
                />
                <p className="text-sm text-center text-white">
                  {Math.round(progress)}%
                </p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs tabular-nums">
                <Image
                  src="/xp-icon.svg"
                  alt="XP"
                  width={11}
                  height={20}
                  className="shrink-0"
                />
                <p className="font-semibold text-white">
                  <CompactNumber
                    value={totalXp}
                    flameGradient
                    enableCountUp
                  />{' '}
                  <span className="text-[#7e7e89] font-medium">/</span>{' '}
                  <CompactNumber
                    value={xpForNextLevel}
                    className="text-[#7e7e89]"
                    tooltipOnlyWhenCompact={false}
                  />{' '}
                  <span className="text-[#7e7e89] font-medium">XP</span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 w-full overflow-x-auto scrollbar-hide py-2">
            <div className="min-w-fit flex justify-center">
              <ActivityCalendar activities={lessonActivity?.days} />
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/learn/tracking"
              className="flex items-center justify-between py-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span className="text-[#C4C4CC] text-sm font-medium">
                Ver meu progresso
              </span>
              <CaretRight
                size={16}
                className="text-[#C4C4CC]"
                weight="regular"
              />
            </Link>
          </div>
        </div>
      </div>
      {!hasPaidPlan(userPlan) && <CtaFacaUpgradeCard />}
      <div className="bg-surface-2 border border-[#25252A] rounded-[20px] w-full p-6">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={24} weight="fill" className="text-[#FF6200]" />
          <span className="text-white text-lg font-semibold">Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{streak?.current ?? 0}</span>
          <span className="text-sm text-[#C4C4CC]">
            {(streak?.current ?? 0) === 1 ? 'dia' : 'dias'}
          </span>
        </div>
        <p className="text-xs text-[#737373] mt-2">
          Assista uma aula para aumentar seu streak
        </p>
      </div>
    </div>
  )
}
