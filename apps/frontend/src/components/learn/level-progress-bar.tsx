'use client'

import { useEffect, useState, useMemo } from 'react'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { getCourseRoadmap } from '@/actions/course'
import type { RoadmapResponse } from '@/types/roadmap'
import { CertificateIcon, LockOpen } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { ModuleProgressBar } from './module-progress-bar'
import { findLessonContext } from '@/utils/lesson-url'

function resolveNextModuleNumber(
  currentModuleNumber: number,
  totalModules: number,
  apiNext: number | null | undefined,
): number | null {
  if (currentModuleNumber >= totalModules) return null
  const fallback =
    currentModuleNumber + 1 <= totalModules ? currentModuleNumber + 1 : null
  if (apiNext == null || apiNext <= currentModuleNumber) return fallback
  if (apiNext > totalModules) return fallback
  return apiNext
}

export function LevelProgressBar() {
  const { activeCourse } = useActiveCourseStore()
  const { lessonCompletedTimestamp, moduleUnlockedTimestamp, currentLesson } =
    useCourseModalStore()
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)

  useEffect(() => {
    async function fetchRoadmap() {
      if (!activeCourse?.id) return

      try {
        if (lessonCompletedTimestamp || moduleUnlockedTimestamp) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        const roadmapData = await getCourseRoadmap(activeCourse.id)
        setRoadmap(roadmapData)
      } catch (error) {
        console.error('Erro ao buscar roadmap:', error)
      }
    }

    fetchRoadmap()
  }, [activeCourse?.id, lessonCompletedTimestamp, moduleUnlockedTimestamp])

  const { currentModule, currentLevel, nextLevel, isLastModule } =
    useMemo(() => {
      if (!roadmap || !roadmap.modules || roadmap.modules.length === 0) {
        return {
          currentModule: null,
          currentLevel: 1,
          nextLevel: null,
          isLastModule: false,
        }
      }

      const totalModules = roadmap.course.totalModules || roadmap.modules.length

      if (currentLesson) {
        const context = findLessonContext(currentLesson.id, roadmap.modules)
        if (context) {
          const moduleIndex = roadmap.modules.findIndex(
            (m) => m.id === context.module.id,
          )
          const moduleNumber =
            moduleIndex >= 0
              ? moduleIndex + 1
              : roadmap.course.currentModule || 1
          const isLastModule = moduleNumber === totalModules
          const nextModuleNumber = isLastModule
            ? null
            : resolveNextModuleNumber(
              moduleNumber,
              totalModules,
              roadmap.course.nextModule,
            )

          return {
            currentModule: context.module,
            currentLevel: moduleNumber,
            nextLevel: nextModuleNumber,
            isLastModule,
          }
        }
      }

      const currentModuleNumber = roadmap.course.currentModule || 1

      const currentModuleIndex = currentModuleNumber - 1
      const currentModule = roadmap.modules[currentModuleIndex] || null

      const isLastModule = currentModuleNumber === totalModules
      const nextModuleNumber = isLastModule
        ? null
        : resolveNextModuleNumber(
          currentModuleNumber,
          totalModules,
          roadmap.course.nextModule,
        )

      return {
        currentModule,
        currentLevel: currentModuleNumber,
        nextLevel: nextModuleNumber,
        isLastModule,
      }
    }, [roadmap, currentLesson])

  const progressValue = currentModule
    ? Math.round(currentModule.progress * 100)
    : roadmap?.modules && roadmap.modules[0]
      ? Math.round(roadmap.modules[0].progress * 100)
      : 0

  return (
    <div className="flex justify-between items-center w-full gap-3">
      <div className="flex items-center justify-center flex-col text-muted-foreground">
        <div className="w-[32px] h-[32px] bg-blue-gradient-500 border-[#00C8FF] shadow-[0_0_12px_#00C8FF] rounded-full border flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {currentLevel}
          </span>
        </div>
        <span className="text-xs text-nowrap">Level {currentLevel}</span>
      </div>

      <ModuleProgressBar value={progressValue} showTrophy={false} />

      <div className="flex items-center justify-center flex-col text-muted-foreground">
        {isLastModule ? (
          <>
            {roadmap?.course.isCompleted ? (
              <Link
                href="/account/certificates"
                className="flex items-center justify-center flex-col cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-[32px] h-[32px] border border-[#00c8ff] shadow-[0_0_12px_#00c8ff] rounded-full flex items-center justify-center bg-blue-gradient-500">
                  <CertificateIcon
                    size={18}
                    className="text-[#ffffff]"
                    weight="fill"
                  />
                </div>
                <span className="text-xs text-nowrap text-[#00c8ff]">
                  Gerar Certificado
                </span>
              </Link>
            ) : (
              <>
                <div className="w-[32px] h-[32px] flex items-center justify-center border border-[#484850] rounded-full">
                  <CertificateIcon
                    size={18}
                    className="text-[#484850]"
                    weight="fill"
                  />
                </div>
                <span className="text-xs text-[#484850] text-nowrap">
                  Certificado
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <div
              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${progressValue === 100
                ? 'bg-blue-gradient-500 border-[#00C8FF] shadow-[0_0_12px_#00C8FF]'
                : 'bg-[#19191b] border-[#484850]'
                }`}
            >
              {progressValue === 100 ? (
                <LockOpen size={18} weight="fill" className="text-white" />
              ) : (
                <span className="text-[#484850] font-bold text-sm">
                  {nextLevel}
                </span>
              )}
            </div>
            <span className="text-xs text-nowrap">Level {nextLevel}</span>
          </>
        )}
      </div>
    </div>
  )
}
