'use client'

import { MessageCircle, ChevronDown } from 'lucide-react' // Importada a ChevronDown
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Check } from '@phosphor-icons/react/dist/ssr'
import { continueCourse } from '@/actions/course'
import { useState } from 'react'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { cn } from '@/lib/utils'

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

  const handleMarkAsWatched = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentLesson?.id || isMarking || isMarked) return

    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)

      if (result?.success) {
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
    <Accordion type="single" collapsible className="mt-6 mb-8" defaultValue="lesson-info">
      <AccordionItem value="lesson-info" className="border-none">
        <div className="w-full mx-auto lg:rounded-[24px] rounded-none overflow-hidden lg:border border-y border-[#2A2A2A] bg-[#151518] shadow-2xl">

          <AccordionTrigger className="hover:no-underline bg-[#0C0C0F] group lg:px-8 px-6 py-6 lg:py-8 [&[data-state=open]>svg]:rotate-180">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full text-left mr-4">
              <h1 className="bg-blue-gradient-500 lg:block hidden bg-clip-text text-transparent lg:text-2xl text-xl font-bold tracking-tight">
                {title}
              </h1>

              <div className="flex items-center gap-3">
                <div
                  onClick={handleMarkAsWatched}
                  className={cn(
                    "flex items-center justify-center w-full lg:w-fit gap-2 border px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
                    isMarked
                      ? "bg-green-500/10 border-green-500/50 text-green-400"
                      : "border-[#25252A] text-white hover:border-[#00b3e4] bg-white/5",
                    (isMarking || !currentLesson) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Check weight="bold" size={18} />
                  {isMarking ? 'Marcando...' : isMarked ? 'Concluída' : 'Completar lição'}
                </div>
              </div>
            </div>
            {/* Seta Arrow com transição de rotação */}
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