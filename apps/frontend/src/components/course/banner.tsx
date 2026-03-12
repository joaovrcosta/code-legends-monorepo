'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  ArrowClockwise,
  Certificate,
  PlayIcon,
  PlusIcon,
  PuzzlePiece,
  ThumbsUpIcon,
  ThumbsDown,
  Trophy,
  VideoCameraIcon,
  CaretLeftIcon,
} from '@phosphor-icons/react/dist/ssr'
import { ArrowLeft, ChartNoAxesColumnIncreasingIcon, Loader2 } from 'lucide-react'

import { getUserEnrolledList } from '@/actions/progress/get-user-enrolled-list'
import { useEnrolledCoursesStore } from '@/stores/enrolled-courses-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { useActiveCourseStore } from '@/stores/active-course-store'

import { CourseDetail } from '@/types/course-types'
import type { UserCourseProgressResponse } from '@/types/user-course.ts'
import { getAuroraBackground } from '@/utils/hexToRgb'
import { LevelBars } from './level-bars'

interface CourseBannerProps {
  course: CourseDetail
  userProgress?: UserCourseProgressResponse | null
}

const getLevelLabel = (level: string): string => {
  const levelMap: Record<string, string> = {
    beginner: 'INICIANTE',
    intermediate: 'INTERMEDIÁRIO',
    advanced: 'AVANÇADO',
  }
  return levelMap[level] || level.toUpperCase()
}

const getLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    beginner: 'text-green-500',
    intermediate: 'text-orange-500',
    advanced: 'text-red-500',
  }
  return colorMap[level] || 'text-orange-500'
}

export function CourseBanner({ course, userProgress }: CourseBannerProps) {
  const router = useRouter()
  const refreshEnrolledCourses = useEnrolledCoursesStore((state) => state.refreshEnrolledCourses)

  const [mounted, setMounted] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    async function checkEnrollment() {
      try {
        const { userCourses } = await getUserEnrolledList()
        const enrolled = userCourses.some((c) => c.courseId === course.id)
        setIsEnrolled(enrolled)
      } catch (error) {
        console.error('Erro ao verificar inscrição:', error)
      } finally {
        setIsCheckingEnrollment(false)
      }
    }
    checkEnrollment()
  }, [course.id, mounted])

  useEffect(() => {
    const scrollContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement
    if (!scrollContainer) return

    const handleScroll = () => {
      setShowSticky(scrollContainer.scrollTop > 440)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEnrollOnly = useCallback(async () => {
    if (isEnrolled || isCheckingEnrollment || isLoadingAction) return
    try {
      setIsLoadingAction(true)
      const { enrollInCourse } = await import('@/actions/course/enroll')
      await enrollInCourse(course.id)
      setIsEnrolled(true)
      await refreshEnrolledCourses()
    } catch (error) {
      console.error('Erro ao inscrever no curso:', error)
      alert(error instanceof Error ? error.message : 'Erro ao inscrever no curso')
    } finally {
      setIsLoadingAction(false)
    }
  }, [course.id, isEnrolled, isCheckingEnrollment, isLoadingAction, refreshEnrolledCourses])

  // Inicia o curso e redireciona para a aula correta
  const handleAccessCourse = useCallback(async () => {
    try {
      setIsLoadingAction(true)

      const { startCourse } = await import('@/actions/course/start')
      await startCourse(course.id)

      // Sincroniza o curso ativo no store para o classroom usar o ID correto
      try {
        const { getActiveCourse } = await import('@/actions/user/get-active-course')
        const active = await getActiveCourse()
        if (active) {
          useActiveCourseStore.getState().setActiveCourse(active)
        }
      } catch (syncError) {
        console.error('Erro ao sincronizar curso ativo no store:', syncError)
      }

      const { getCourseRoadmap } = await import('@/actions/course/roadmap')
      const { findLessonContext, generateLessonUrl } = await import('@/utils/lesson-url')

      const roadmap = await getCourseRoadmap(course.id)

      if (roadmap?.modules) {
        const allLessons = roadmap.modules.flatMap((m) =>
          (m.groups || []).flatMap((g) => g.lessons || []),
        )

        const targetLesson =
          allLessons.find((l) => l.isCurrent && l.status !== 'locked') ||
          allLessons.find((l) => l.status !== 'locked') ||
          null

        if (targetLesson) {
          const context = findLessonContext(targetLesson.id, roadmap.modules)
          if (context) {
            const url = generateLessonUrl(targetLesson, context.module, context.group)
            router.push(url)
            return
          }
        }
      }

      router.push('/classroom')
    } catch (error) {
      console.error('Erro ao acessar o curso:', error)
      router.push('/classroom')
    } finally {
      setIsLoadingAction(false)
    }
  }, [course.id, router])

  const handleCourseAction = useCallback(async () => {
    if (isCheckingEnrollment || isLoadingAction) return

    if (!isEnrolled) {
      await handleEnrollOnly()
      return
    }

    await handleAccessCourse()
  }, [handleAccessCourse, handleEnrollOnly, isCheckingEnrollment, isEnrolled, isLoadingAction])

  const handleResetProgress = async () => {
    try {
      setIsResetting(true)
      const { resetCourseProgress } = await import('@/actions/course/reset-progress')
      const result = await resetCourseProgress(course.id)

      if (result.success) {
        setShowResetModal(false)
        useCourseModalStore.getState().setLastModuleCompletion(null)
        await refreshEnrolledCourses()
        router.refresh()
      } else {
        alert(result.error || 'Erro ao resetar progresso')
      }
    } catch (error) {
      console.error('Erro ao resetar:', error)
    } finally {
      setIsResetting(false)
    }
  }

  const renderButtonContent = () => {
    if (!mounted || isCheckingEnrollment) return 'Verificando...'
    if (isLoadingAction) return <Loader2 className="animate-spin" size={24} />
    return isEnrolled ? (
      <>
        <PlayIcon weight="fill" className="mr-2" /> Acessar
      </>
    ) : (
      <>
        <PlusIcon className="mr-2" /> Inscrever-se
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'sticky lg:top-[0px] top-[-1px] z-50 transition-all shadow-2xl duration-300 border-b border-[#25252A] bg-[#151518] p-3 px-4',
          showSticky
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none h-0 overflow-hidden p-0',
        )}
      >
        <div className="flex items-center justify-between lg:px-4 px-0">
          <span
            className={cn('font-bold text-xl', !course.colorHex && 'text-white')}
            style={{ color: '#FFFFFF' }}
          >
            {course.title}
          </span>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCourseAction}
              disabled={isLoadingAction || isCheckingEnrollment}
              className="bg-blue-gradient-500 transition-all rounded-[12px] duration-300 hover:shadow-[0_0_12px_#00C8FF] font-semibold px-6 h-[42px] disabled:opacity-50"
            >
              {renderButtonContent()}
            </Button>
          </div>
        </div>
      </div>


      <section
        className="relative border-b border-[#25252A] lg:py-12 lg:pb-24 lg:px-12 px-6 pb-8 pt-4 flex flex-col lg:flex-row items-center"
        style={getAuroraBackground(course.colorHex)}
      >
        <div className='flex w-full items-center justify-center max-w-[1356px] gap-2 mx-auto flex-col lg:flex-row'>
          <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

          <div className="flex-col flex-1 relative z-10">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="hover:bg-[#25252A] group p-2 lg:bg-transparent relative lg:top-0 top-[12px] bg-white/5 rounded-lg flex items-center gap-2 mb-4 text-[#7e7e89] transition-colors"
            >
              <CaretLeftIcon size={24} weight="bold" />
              <span className="text-xs lg:block hidden uppercase tracking-wider">Voltar</span>
            </button>

            {/* Course Icon */}
            <div className="lg:block flex items-center justify-center mb-4">
              {course.icon && (
                <Image src={course.icon} alt={course.title} width={120} height={120} className='relative lg:right-[20px] right-0' />
              )}
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <h1
                className={cn(
                  'font-bold lg:text-[44px] text-2xl lg:text-left text-center mb-4',
                  !course.colorHex && 'text-[#e0e0ee]',
                )}
                style={{ color: '#FFFFFF' }}
              >
                {course.title}
              </h1>
              <p className="lg:text-base text-sm mt-2 text-center lg:text-left max-w-[620px] text-[#a5a5a6]">
                {course.description}
              </p>

              {/* Progress & Reset */}
              <div className="flex-col pb-12 mt-6 w-full max-w-[500px]">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#7e7e89]">
                      <span>Seu Progresso</span>
                      <span className="text-white text-sm">{Math.round(userProgress?.course.progress ?? 0)}%</span>
                    </div>
                    <Progress value={userProgress?.course.progress ?? 0} className="h-[2px] bg-[#1a1a1e]">
                      <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(0,200,255,0.4)]" />
                    </Progress>
                  </div>
                  <Trophy size={32} weight="fill" className={userProgress?.course.progress === 100 ? "text-yellow-500" : "text-[#25252A]"} />
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="flex items-center lg:justify-start lg:mb-0 mb-8 justify-center gap-4 w-full">
                <Button
                  onClick={handleCourseAction}
                  disabled={isLoadingAction || isCheckingEnrollment}
                  className="lg:w-fit w-full h-[54px] px-10 text-lg bg-blue-gradient-500 rounded-[12px] hover:shadow-[0_0_15px_#00C8FF] transition-all disabled:opacity-50"
                >
                  {renderButtonContent()}
                </Button>

                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-[54px] w-[54px] flex items-center justify-center border-[2px] rounded-full border-[#515155] hover:bg-[#424141] transition-colors">
                        <ThumbsUpIcon size={24} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="rounded-full bg-[#1e1e22] border-[#2a2a2f] flex gap-2 p-2">
                      <DropdownMenuItem className="rounded-full h-10 w-10 p-0 flex items-center justify-center hover:bg-red-500/20">
                        <ThumbsDown size={20} />
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-full h-10 w-10 p-0 flex items-center justify-center hover:bg-green-500/20">
                        <ThumbsUpIcon size={20} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isEnrolled && (
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="h-[54px] w-[54px] flex items-center justify-center border-2 rounded-full border-[#25252A] text-[#7e7e89] hover:text-red-400 hover:border-red-400/30 transition-all"
                      title="Resetar progresso"
                    >
                      <ArrowClockwise size={26} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR INFO */}
          <div className="flex-1 w-full relative z-10">
            <ul className="space-y-1">
              <InfoItem icon={<Certificate size={22} className="text-[#00C8FF]" />} text="Certificado de conclusão" />
              <InfoItem icon={<PuzzlePiece size={22} className="text-[#00C8FF]" />} text={<span><strong>7</strong> Projetos práticos</span>} />
              <InfoItem icon={<VideoCameraIcon size={22} className="text-[#00C8FF]" />} text={<span><strong>{course.totalDuration || '0h'}</strong> de conteúdo</span>} />
              <li className="flex w-full items-center gap-4 py-4 border-b border-[#25252A]/50 last:border-0 group">
                <LevelBars level={course.level} />
              </li>
            </ul>

            {course.instructor && (
              <div className="mt-8 rounded-xllg:w-fit w-full z-0">
                <p className="text-[10px] text-muted-foreground tracking-widest mb-3 uppercase">Instrutor</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-[#25252A]">
                    <AvatarImage src={course.instructor.avatar || ''} />
                    <AvatarFallback className="bg-[#25252A]">{course.instructor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm font-medium z-0">{course.instructor.name}</p>
                    <p className="text-xs text-[#7e7e89]">Educator</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-[#0c0c0f] border-[#25252A] max-w-[420px] rounded-[32px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <ArrowClockwise size={32} className="text-red-500" />
            </div>
            <DialogTitle className='text-2xl font-black uppercase italic tracking-tighter'>Resetar curso?</DialogTitle>
            <DialogDescription className="text-[#a5a5a6] pt-2">
              Esta ação é **irreversível**. Seu histórico de progresso e certificados ganhos neste curso serão apagados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="ghost"
              onClick={() => setShowResetModal(false)}
              className="flex-1 h-12 rounded-xl font-bold text-[#7e7e89] hover:text-white"
            >
              Manter progresso
            </Button>
            <Button
              onClick={handleResetProgress}
              disabled={isResetting}
              className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-95"
            >
              {isResetting ? 'Limpando...' : 'Confirmar Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <li className="flex w-full items-center gap-3 py-4 border-b border-[#25252A]/50 last:border-0">
      {icon}
      <p className="text-[#a5a5a6] text-sm font-light">{text}</p>
    </li>
  )
}