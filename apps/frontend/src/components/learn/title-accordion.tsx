'use client'

import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { useState } from 'react'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { cn } from '@/lib/utils'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import { ClassroomAutoplayToggle } from '@/components/classroom/classroom-autoplay-toggle'
import { ClassroomLikesToolbar } from '@/components/classroom/classroom-likes-toolbar'

interface TitleAccordionProps {
  title: string | undefined
  description: string | undefined
}

function LessonEducator() {
  return (
    <div className="flex items-center gap-3 pt-8">
      <Avatar className="h-10 w-10 border border-[#25252A] lg:border-0">
        <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?v=4" />
        <AvatarFallback>JV</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-white">João Victor</p>
        <p className="text-[11px] text-[#7e7e89] tracking-wider font-semibold">
          Educator
        </p>
      </div>
    </div>
  )
}

function LessonDescription({ description }: { description: string | undefined }) {
  return (
    <p className="text-[#a5a5a6] lg:text-base text-sm leading-relaxed max-w-[900px]">
      {description}
    </p>
  )
}

export function TitleAccordion({ title, description }: TitleAccordionProps) {
  const [isMarking, setIsMarking] = useState(false)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    currentLesson,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  } = useCourseModalStore()

  const isMarked = currentLesson?.status === 'completed'

  const handleMarkAsWatched = async () => {
    if (!currentLesson?.id || isMarking || isMarked) return

    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)

      if (result?.success) {
        showLessonXpToast(result)
        maybeShowStreakCongrats(result)
        if (result.moduleCompleted) {
          setLastModuleCompletion({
            moduleCompleted: true,
            moduleId: result.moduleId,
            moduleTitle: result.moduleTitle,
            progress: result.progress,
            xpGained: result.xpGained,
            xpGainedInModule: result.xpGainedInModule,
            xpGainedInModuleBySkill: result.xpGainedInModuleBySkill,
          })
          setShowModuleStatsOnce(true)
        }
        updateCurrentLessonStatus('completed')
        await fetchActiveCourse()
      }
    } catch (error) {
      console.error('Erro ao marcar como assistido:', error)
    } finally {
      setIsMarking(false)
    }
  }

  const completeAndAutoplay = (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full lg:w-auto',
          (isMarking || !currentLesson) && 'opacity-50',
        )}
      >
        <CompleteLessonButton
          variant="learn"
          as="div"
          onClick={handleMarkAsWatched}
          isMarking={isMarking}
          isMarked={isMarked}
          disabled={isMarking || !currentLesson || isMarked}
          iconSize={18}
          className="cursor-pointer w-full lg:w-fit"
          markLabel="Completar lição"
          markedLabel="Concluída"
          markingLabel="Marcando..."
        />
      </div>
      {currentLesson?.type === 'video' && <ClassroomAutoplayToggle />}
    </>
  )

  const desktopActionButtons = (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      <ClassroomLikesToolbar lessonId={currentLesson?.id} />
      {completeAndAutoplay}
    </div>
  )

  const mobileActionButtons = (
    <div className="mr-4 flex flex-col justify-between gap-4 w-full text-left">
      {completeAndAutoplay}
    </div>
  )

  return (
    <div className="mt-4 mb-8 px-0">
      {/* Desktop: sem fundo/sombra, alinhado à esquerda com o player */}
      <div className="hidden lg:block w-full overflow-hidden">
        <div className="px-2">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <h1 className="bg-blue-gradient-500 bg-clip-text text-transparent text-2xl font-bold tracking-tight">
              {title}
            </h1>
            {desktopActionButtons}
          </div>
        </div>

        <div className="px-0 pb-6">
          <div className="pt-2 px-2">
            <LessonDescription description={description} />
            <LessonEducator />
          </div>
        </div>
      </div>

      {/* Mobile: accordion com borda e dropdown */}
      <Accordion
        type="single"
        collapsible
        className="lg:hidden"
        defaultValue="lesson-info"
      >
        <AccordionItem value="lesson-info" className="border-none">
          <div className="w-full mx-auto rounded-none overflow-hidden border-y border-[#2A2A2A] bg-[#151518] shadow-2xl">
            <AccordionTrigger className="hover:no-underline bg-[#0C0C0F] group px-6 py-6 [&[data-state=open]>svg]:rotate-180">
              {mobileActionButtons}
              <ChevronDown className="h-5 w-5 shrink-0 text-[#7e7e89] transition-transform duration-200" />
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 border-t border-[#25252A] bg-[#0C0C0F]">
              <div className="pt-6">
                <LessonDescription description={description} />
                <LessonEducator />
              </div>
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
