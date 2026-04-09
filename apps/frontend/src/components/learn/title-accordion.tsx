'use client'

import { MessageCircle, ChevronDown } from 'lucide-react' // Importada a ChevronDown
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { useState } from 'react'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { cn } from '@/lib/utils'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'

interface TitleAccordionProps {
  title: string | undefined
  description: string | undefined
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

  return (
    <Accordion type="single" collapsible className="mt-6 mb-8 px-6" defaultValue="lesson-info">
      <AccordionItem value="lesson-info" className="border-none">
        <div className="w-full mx-auto lg:rounded-[24px] rounded-none overflow-hidden lg:border border-y border-[#2A2A2A] bg-[#151518] shadow-2xl">

          <AccordionTrigger className="hover:no-underline bg-[#0C0C0F] group lg:px-8 px-6 py-6 lg:py-8 [&[data-state=open]>svg]:rotate-180">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full text-left mr-4">
              <h1 className="bg-blue-gradient-500 lg:block hidden bg-clip-text text-transparent lg:text-2xl text-xl font-bold tracking-tight">
                {title}
              </h1>

              <div className="flex items-center gap-3">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={cn((isMarking || !currentLesson) && "opacity-50")}
                >
                  <CompleteLessonButton
                    variant="learn"
                    as="div"
                    onClick={handleMarkAsWatched}
                    isMarking={isMarking}
                    isMarked={isMarked}
                    disabled={isMarking || !currentLesson || isMarked}
                    iconSize={18}
                    className="cursor-pointer"
                    markLabel="Completar lição"
                    markedLabel="Concluída"
                    markingLabel="Marcando..."
                  />
                </div>
              </div>
            </div>
            <ChevronDown
              className="h-5 w-5 shrink-0 text-[#7e7e89] transition-transform duration-200"
            />
          </AccordionTrigger>

          <AccordionContent className="lg:px-8 px-6 pb-8 border-t border-[#25252A] bg-[#0C0C0F]">
            <div className="pt-6">
              <p className="text-[#a5a5a6] lg:text-base text-sm leading-relaxed mb-8 max-w-[900px]">
                {description}
              </p>

              <div className="flex items-center gap-3 py-3">
                <Avatar className="h-10 w-10 border border-[#25252A]">
                  <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?v=4" />
                  <AvatarFallback>JV</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white">João Victor</p>
                  <p className="text-[11px] text-[#7e7e89] uppercase tracking-wider font-semibold">Educator</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  )
}