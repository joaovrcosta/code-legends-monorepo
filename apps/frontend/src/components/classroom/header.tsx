'use client'

import Image from 'next/image'
import codeLegendsLogo from '../../../public/code-legends-logo.svg'
import Link from 'next/link'
import { Lightning, SkipBack, SkipForward } from '@phosphor-icons/react/dist/ssr'
import codeLegendsLogoMobile from '../../../public/logo-mobile.png'
import { UserDropdown } from '../user-dropdown'
import { StrikeSection } from '../strike-section'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import type { EnrolledCourse, ActiveCourse } from '@/types/user-course.ts'
import { useState, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useClassroomAutoplayStore } from '@/stores/classroom-autoplay-store'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useRoadmapUpdater } from '@/hooks/use-roadmap-updater'
import type { RoadmapResponse } from '@/types/roadmap'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/skeleton'

interface ClassroomHeaderProps {
  initialUserCourses: EnrolledCourse[]
  initialActiveCourse: ActiveCourse | null
}

/** Slug da aula na URL `/classroom/.../lesson/:slug` — fora desse padrão devolve `null`. */
function classroomRouteLessonSlug(pathname: string | null): string | null {
  if (!pathname) return null
  const parts = pathname.split('/').filter(Boolean)
  const i = parts.indexOf('lesson')
  if (i === -1 || !parts[i + 1]) return null
  try {
    return decodeURIComponent(parts[i + 1])
  } catch {
    return parts[i + 1]
  }
}

export default function ClassroomHeader({
  initialUserCourses: _initialUserCourses,
  initialActiveCourse,
}: ClassroomHeaderProps) {
  const { data: session } = useSession()
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan
  const showLessonLightning = userPlan === 'FREE'

  const { activeCourse, setActiveCourse } = useActiveCourseStore()
  const { currentLesson, exclusiveAccessBlocked } = useCourseModalStore()
  const pathname = usePathname()
  const {
    isAutoplayEnabled,
    hydrated: autoplayHydrated,
    hydrate: hydrateAutoplay,
    setAutoplayEnabled,
  } = useClassroomAutoplayStore()
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)

  useEffect(() => {
    hydrateAutoplay()
  }, [hydrateAutoplay])

  const routeLessonSlug = useMemo(
    () => classroomRouteLessonSlug(pathname),
    [pathname],
  )
  /** URL já mudou para outra aula, mas a store ainda tem a lição anterior — carregando. */
  const isLessonNavLoading =
    routeLessonSlug != null &&
    currentLesson != null &&
    routeLessonSlug !== currentLesson.slug

  useEffect(() => {
    setActiveCourse(initialActiveCourse ?? null)
  }, [
    initialActiveCourse?.id,
    initialActiveCourse?.title,
    initialActiveCourse?.slug,
    initialActiveCourse?.progress,
    initialActiveCourse?.isCompleted,
    initialActiveCourse?.currentModuleId,
    initialActiveCourse?.currentTaskId,
    setActiveCourse,
  ])

  useRoadmapUpdater({
    isOpen: true,
    courseId: activeCourse?.id,
    currentLessonId: currentLesson?.id,
    lessonCompletedTimestamp: null,
    onRoadmapUpdate: setRoadmap,
  })

  const currentActiveCourse = activeCourse || initialActiveCourse

  const coursePath = currentActiveCourse?.slug
    ? `/learn/paths/${currentActiveCourse.slug}`
    : '/learn/catalog'

  const courseName = currentActiveCourse?.title || 'Curso'

  const { moduleTitle, groupTitle } = useMemo(() => {
    let moduleTitleValue: string | undefined
    let groupTitleValue: string | undefined

    if (roadmap?.modules && currentLesson) {
      for (const moduleItem of roadmap.modules) {
        for (const groupItem of moduleItem.groups || []) {
          if (groupItem.lessons?.some((l) => l.id === currentLesson.id)) {
            moduleTitleValue = moduleItem.title
            groupTitleValue = groupItem.title
            break
          }
        }
        if (moduleTitleValue && groupTitleValue) break
      }
    }

    return { moduleTitle: moduleTitleValue, groupTitle: groupTitleValue }
  }, [roadmap?.modules, currentLesson])

  const breadcrumbPath = useMemo(() => {
    return [currentActiveCourse?.title, moduleTitle, groupTitle]
      .filter(Boolean)
      .join(' / ')
  }, [currentActiveCourse?.title, moduleTitle, groupTitle])

  const showLessonTitleSkeleton =
    isLessonNavLoading && !exclusiveAccessBlocked

  /** Título no header: aula bloqueada ou paywall → sempre “Aula exclusiva”. */
  const displayLessonTitle = useMemo(() => {
    if (exclusiveAccessBlocked) return 'Aula exclusiva'
    if (currentLesson?.status === 'locked') return 'Aula exclusiva'
    return currentLesson?.title ?? 'Aula exclusiva'
  }, [currentLesson, exclusiveAccessBlocked])

  /** Free = lime, paga = roxo, sem acesso = amarelo; carregando troca de aula = cinza (#18181f+). */
  const lessonLightningClass = useMemo(() => {
    if (isLessonNavLoading && !exclusiveAccessBlocked) {
      /* Cinza mais claro que #18181f (mesma família do surface) */
      return 'text-[#3D3D47]'
    }
    if (
      exclusiveAccessBlocked ||
      !currentLesson ||
      currentLesson.status === 'locked'
    ) {
      return 'text-yellow-400'
    }
    if (currentLesson.isFree === true) {
      return 'text-lime-400'
    }
    return 'text-purple-400'
  }, [currentLesson, exclusiveAccessBlocked, isLessonNavLoading])

  const lessonXpReward = useMemo(() => {
    if (exclusiveAccessBlocked || !currentLesson) return null
    if (
      currentLesson.status === 'completed' ||
      currentLesson.status === 'locked'
    ) {
      return null
    }
    const xp = currentLesson.xpReward
    if (typeof xp !== 'number' || xp <= 0) return null
    return xp
  }, [currentLesson, exclusiveAccessBlocked])

  return (
    <div className="fixed top-0 left-0 w-full z-40">
      <header className="fixed top-0 left-0 w-full z-40 overflow-hidden bg-surface shadow-none lg:py-0 pb-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-primary/25 bg-dots-pattern bg-repeat-x bg-[length:auto_100%] bg-[position:center_top] [mask-image:linear-gradient(180deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] [mask-type:alpha] after:pointer-events-none after:absolute after:inset-0 after:bg-brand-seagull-950/90 after:content-['']"
        />
        <ul className="relative z-10 mx-auto flex w-full items-center justify-between px-4 py-2 lg:pt-4 lg:pb-4">
          <li className="flex items-center lg:space-x-6">
            <div className="flex items-center space-x-4">
              <div>
                <Link href="/">
                  <Image
                    src={codeLegendsLogo}
                    alt="Code Legends"
                    className="lg:block hidden"
                  />
                </Link>
                <Link href="/">
                  <Image
                    src={codeLegendsLogoMobile}
                    alt="Code Legends"
                    className="lg:hidden block"
                    height={24}
                    width={24}
                  />
                </Link>
              </div>
            </div>
            {currentActiveCourse && (
              <Link href={coursePath}>
                <div className="border rounded-full border-[#25252a] py-2 lg:flex hidden items-center gap-2 px-3 hover:bg-[#25252a] cursor-pointer transition-colors duration-150 ease-in-out">
                  {currentActiveCourse?.icon ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={currentActiveCourse.icon}
                        alt={courseName}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {courseName[0]?.toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}

                  <span className="text-[14px] truncate max-w-[160px]">
                    {courseName}
                  </span>
                </div>
              </Link>
            )}
            <div className="p-2 lg:flex hidden px-3 space-x-2">
              <SkipBack size={24} />
              <SkipForward size={24} weight="fill" />
            </div>
            <div
              className="flex items-center gap-2 p-2 lg:flex hidden px-3 min-w-0 max-w-[320px]"
              aria-busy={showLessonTitleSkeleton}
            >
              {showLessonLightning && (
                <Lightning
                  size={18}
                  weight="fill"
                  className={cn('shrink-0', lessonLightningClass)}
                  aria-hidden
                />
              )}
              {showLessonTitleSkeleton ? (
                <Skeleton
                  variant="rectangular"
                  animate="pulse"
                  width={168}
                  height={14}
                  className="!mt-0 !mb-0 h-3.5 max-w-[200px] shrink-0 rounded-md !bg-[#18181f]"
                />
              ) : (
                <p
                  className="text-sm truncate min-w-0 flex-1 min-h-[1.25rem] text-white"
                  aria-live="polite"
                >
                  {displayLessonTitle}
                </p>
              )}
              {lessonXpReward != null && !showLessonTitleSkeleton && (
                <span
                  className="ml-2 shrink-0 flex items-center gap-1 text-sm font-thin text-white tabular-nums"
                  title={`+${lessonXpReward.toLocaleString('pt-BR')} XP ao concluir esta aula`}
                >
                  {lessonXpReward.toLocaleString('pt-BR')}XP
                  <Image
                    src="/xp-icon.svg"
                    alt=""
                    width={11}
                    height={20}
                    className="h-3.5 w-auto object-contain"
                    aria-hidden
                  />
                </span>
              )}
            </div>
          </li>

          <li className="flex lg:space-x-2 space-x-1 items-center ">
            <div className="flex items-center lg:space-x-4 space-x-4">
              <StrikeSection />
              <UserDropdown />
            </div>
          </li>
        </ul>

        <div className="relative z-10 lg:hidden block border-t border-[#25252A]/60">
          <div className="bg-transparent">
            <div className="flex items-center justify-between px-4 py-2">
              {/* Lado esquerdo */}
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                <Link
                  href={`/learn/paths/${currentActiveCourse?.slug}`}
                  className="flex items-center justify-center"
                >
                  <button className="flex-shrink-0 text-white hover:text-[#00C8FF] transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                </Link>

                <div className="h-6 w-px bg-[#25252A]" />

                {/* Ícone do curso */}
                {currentActiveCourse?.icon ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={currentActiveCourse.icon}
                      alt={courseName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {courseName[0]?.toUpperCase() || 'C'}
                    </span>
                  </div>
                )}

                {/* Breadcrumb */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#C4C4CC] truncate">
                    {breadcrumbPath || courseName}
                  </p>
                </div>
              </div>

              {/* Lado direito */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Reprodução automática */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoplayHydrated ? isAutoplayEnabled : false}
                  aria-label="Reprodução automática entre vídeos"
                  title="Avança automaticamente para o próximo vídeo ao terminar"
                  onClick={() => setAutoplayEnabled(!isAutoplayEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isAutoplayEnabled ? 'bg-[#00C8FF]' : 'bg-[#25252A]'
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAutoplayEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
