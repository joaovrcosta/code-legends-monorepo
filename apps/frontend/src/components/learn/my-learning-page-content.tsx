'use client'

import Image from 'next/image'
import { BookBookmarkIcon } from '@phosphor-icons/react/dist/ssr'
import { Tabs } from '@/components/ui/tabs'
import { LearningCard, learningCardsListClassName } from '@/components/learn/learning-card'
import { MyLearningSidebar } from '@/components/learn/my-learning-sidebar'
import { MyLearningSkillsTab } from '@/components/learn/my-learning-skills-tab'
import type { MyLearningCourse } from '@/actions/progress/my-learning'
import type { LessonActivityDay } from '@/actions/user/get-lesson-activity'
import type { StreakResponse } from '@/actions/user/get-streak'
import type { UserSkillTrackingItem } from '@/actions/user/get-my-skills'

interface MyLearningPageContentProps {
  initialInProgress: MyLearningCourse[]
  initialCompleted: MyLearningCourse[]
  lessonActivity: LessonActivityDay[]
  streak: StreakResponse | null
  skills: UserSkillTrackingItem[]
}

function MyLearningEmptyState({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12 text-center lg:col-span-2">
      <Image
        src="/emptyMail.svg"
        alt=""
        width={120}
        height={88}
        className="mx-auto"
        aria-hidden
      />
      <p className="mt-4 text-sm text-muted">{message}</p>
    </div>
  )
}

function toCardProgress(progress: number) {
  return Math.round(progress * 100)
}

export function MyLearningPageContent({
  initialInProgress,
  initialCompleted,
  lessonActivity,
  streak,
  skills,
}: MyLearningPageContentProps) {
  const inProgressCourses = initialInProgress.map((course) => ({
    ...course,
    progress: toCardProgress(course.progress),
  }))

  const completedCourses = initialCompleted.map((course) => ({
    ...course,
    progress: toCardProgress(course.progress),
  }))

  const myLearningTabs = [
    {
      id: 'in-progress',
      label: 'Em andamento',
      content: (
        <div className={learningCardsListClassName}>
          {inProgressCourses.length === 0 ? (
            <p className="py-8 text-center text-muted">
              Nenhum curso em andamento
            </p>
          ) : (
            inProgressCourses.map((course) => (
              <LearningCard
                key={course.id}
                courseId={course.id}
                slug={course.slug}
                title={course.title}
                progress={course.progress}
                icon={course.icon}
                courseKind={course.kind}
              />
            ))
          )}
        </div>
      ),
    },
    {
      id: 'completed',
      label: 'Concluídos',
      content: (
        <div className={learningCardsListClassName}>
          {completedCourses.length === 0 ? (
            <MyLearningEmptyState message="Nenhum curso concluído ainda" />
          ) : (
            completedCourses.map((course) => (
              <LearningCard
                key={course.id}
                courseId={course.id}
                slug={course.slug}
                title={course.title}
                progress={100}
                icon={course.icon}
                courseKind={course.kind}
                isCompleted
              />
            ))
          )}
        </div>
      ),
    },
    {
      id: 'skills',
      label: 'Habilidades',
      content: <MyLearningSkillsTab skills={skills} />,
    },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-start space-x-2 py-6">
        <BookBookmarkIcon className="text-[#00C8FF]" size={28} weight="fill" />
        <span className="bg-blue-gradient-500 bg-clip-text text-lg font-bold text-transparent">
          Meu Aprendizado
        </span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <Tabs tabs={myLearningTabs} defaultTab="in-progress" />
        </div>

        <MyLearningSidebar activities={lessonActivity} streak={streak} />
      </div>
    </div>
  )
}
