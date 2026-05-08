import { getCurrentUser } from '@/actions/user'
import { getMySkills } from '@/actions/user/get-my-skills'
import { SkillsTrackingCard } from '@/components/learn/skills-tracking-card'
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
import { getStreak } from '@/actions/user/get-streak'
import { getUserCourses } from '@/actions/user/get-user-courses'
import { getLessonActivity } from '@/actions/user/get-lesson-activity'
import { getAuroraBackground } from '@/utils/hexToRgb'
import { Progress } from '@/components/ui/progress'
import { getWeeklyXp } from '@/actions/user/get-weekly-xp'
import { WeeklyXpCard } from '@/components/learn/weekly-xp-card'
import { Lightning } from '@phosphor-icons/react/dist/ssr'

function planToRingVariant(plan?: string): AvatarRingVariant {
  if (plan === 'PRO') return 'pro'
  if (plan === 'PREMIUM') return 'premium'
  return 'free'
}

function planToLightningClass(plan?: string) {
  if (plan === 'PREMIUM') return 'text-[#00FFA3]'
  if (plan === 'PRO') return 'text-[#00C8FF]'
  return 'text-[#7e7e89]'
}

type TrackingStatsPillsProps = {
  coursesCount: number
  totalXp: number
  lessonsDone: number
  projectsDone: number
}

function TrackingStatsPills({
  coursesCount,
  totalXp,
  lessonsDone,
  projectsDone,
}: TrackingStatsPillsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center justify-between rounded-full bg-[#15151B] px-6 py-4">
        <p className="text-[11px] text-[#7e7e89]">Cursos</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{coursesCount}</p>
      </div>

      <div className="flex items-center justify-between rounded-full bg-[#15151B] px-6 py-4">
        <p className="text-[11px] text-[#7e7e89]">Total de XP</p>
        <div className="mt-1 flex items-center gap-2">
          <Image src="/xp-icon.svg" alt="XP" width={11} height={20} />
          <p className="text-2xl font-semibold tabular-nums text-white">
            <CompactNumber value={totalXp} enableCountUp />
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-full bg-[#15151B] px-6 py-4">
        <p className="text-[11px] text-[#7e7e89]">Lições feitas</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
          <CompactNumber value={lessonsDone} enableCountUp />
        </p>
      </div>

      <div className="flex items-center justify-between rounded-full bg-[#15151B] px-6 py-4">
        <p className="text-[11px] text-[#7e7e89]">Projetos concluídos</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
          <CompactNumber value={projectsDone} enableCountUp />
        </p>
      </div>
    </div>
  )
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
  const streak = await getStreak()
  const { skills } = await getMySkills()
  const favoriteCourses = await getUserCourses()
  const lessonActivity = await getLessonActivity({ days: 365 })
  const weekly = await getWeeklyXp()
  const userFromAPIAny = userFromAPI as unknown as {
    completedLessons?: number
    completedProjects?: number
  } | null

  const totalXp =
    userFromAPI?.totalXp ?? user.totalXp ?? skills.reduce((acc, s) => acc + (s.xp ?? 0), 0)
  const level = userFromAPI?.level ?? user.level ?? 1
  const xpRemainingToNextLevel = userFromAPI?.xpToNextLevel ?? user.xpToNextLevel ?? 100
  const xpForNextLevel = totalXp + xpRemainingToNextLevel
  const offensive = streak?.current ?? 0
  const xpProgress = xpForNextLevel > 0 ? Math.max(0, Math.min(1, totalXp / xpForNextLevel)) : 0

  const coursesCount = Array.isArray(favoriteCourses) ? favoriteCourses.length : 0
  const lessonsDone =
    lessonActivity?.days?.reduce((acc, d) => acc + (d.count ?? 0), 0) ??
    userFromAPIAny?.completedLessons ??
    (user as unknown as { completedLessons?: number }).completedLessons ??
    0

  const projectsDone =
    userFromAPIAny?.completedProjects ??
    (user as unknown as { completedProjects?: number }).completedProjects ??
    0

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className="relative overflow-hidden border-b border-[#25252A] p-6 h-[100px] sm:h-[160px]"
        style={getAuroraBackground('#00C8FF')}
      >
      </div>

      <div className="mx-auto max-w-[1420px] px-4 py-6 xl:px-0">
        <div className="grid grid-cols-1 gap-6 lg:[grid-template-columns:756px_1fr]">
          <div className="w-full space-y-6 lg:max-w-[756px]">
            <div
              className=""
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-start gap-4 min-w-0 -mt-[86px]">
                  <Avatar
                    className="h-[100px] w-[100px] shrink-0 sm:h-[100px] sm:w-[100px]"
                    ringVariant={planToRingVariant(userFromAPI?.plan ?? user.plan)}
                  >
                    <AvatarImage src={userFromAPI?.avatar ?? user.avatar ?? ''} alt="" />
                    <AvatarFallback className="bg-[#25252A] text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center justify-between w-full">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[24px] sm:text-2xl font-medium text-white">
                          {userFromAPI?.name ?? user.name}
                        </p>
                        {['PRO', 'PREMIUM'].includes(String(userFromAPI?.plan ?? user.plan)) && (
                          <Lightning
                            size={18}
                            weight="fill"
                            className={planToLightningClass(userFromAPI?.plan ?? user.plan)}
                          />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#7e7e89]">Fullstack developer</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end text-right md:hidden">
                      <p className="text-[40px] font-semibold leading-none tabular-nums text-white sm:text-[52px]">
                        {level}
                      </p>
                      <p className="mt-1 text-sm text-[#7e7e89]">Level</p>
                    </div>
                  </div>
                </div>

                <div className="hidden shrink-0 flex-col items-end text-right md:flex">
                  <p className="text-[40px] font-semibold leading-none tabular-nums text-white sm:text-[52px]">
                    {level}
                  </p>
                  <p className="mt-1 text-sm text-[#7e7e89]">Level</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#7e7e89]">
                    <span></span>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-xs font-normal text-[#00C8FF] tabular-nums">
                        <CompactNumber className="text-xs text-[#00C8FF]" value={totalXp} enableCountUp flameGradient />XP{' '}
                        <span className="text-[#7e7e89] text-xs">/</span>{' '}
                        <CompactNumber
                          value={xpForNextLevel}
                          className="!text-xs !text-[#7e7e89]"
                          tooltipOnlyWhenCompact={false}
                        />
                        XP
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.round(xpProgress * 100)}
                    className="h-[2px] bg-surface-2"
                  >
                    <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(0,200,255,0.4)]" />
                  </Progress>
                </div>
              </div>
            </div>

            <div className="lg:hidden">
              <TrackingStatsPills
                coursesCount={coursesCount}
                totalXp={totalXp}
                lessonsDone={lessonsDone}
                projectsDone={projectsDone}
              />
            </div>

            <SkillsTrackingCard
              skills={skills}
              weeklyXpGained={weekly?.totalXp ?? 0}
              plan={userFromAPI?.plan ?? user.plan}
            />

            {/* Progresso da semana - mobile (abaixo das skills) */}
            <div className="mt-6 lg:hidden">
              <div className="px-1">
                <h2 className="text-[16px] font-semibold tracking-tight text-white">
                  Progresso da semana
                </h2>
              </div>
              <WeeklyXpCard
                days={weekly?.days ?? []}
                totalXp={weekly?.totalXp}
                playerName="Você"
              />
            </div>

            <div className="rounded-[20px] ] px-0 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-semibold tracking-tight text-white">Emblemas</h2>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[18px] border border-[#25252A] bg-[#141417]"
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[18px] border border-[#25252A] bg-[#141417]"
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[18px] border border-[#25252A] bg-[#141417]"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block space-y-4 lg:sticky lg:top-[24px] h-fit w-full">
            <div className="px-6">
              <h2 className="text-[20px] font-semibold tracking-tight text-white">Progresso da semana</h2>
            </div>

            <WeeklyXpCard
              days={weekly?.days ?? []}
              totalXp={weekly?.totalXp}
              playerName="Você"
            />
            <div className="hidden lg:block">
              <TrackingStatsPills
                coursesCount={coursesCount}
                totalXp={totalXp}
                lessonsDone={lessonsDone}
                projectsDone={projectsDone}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}