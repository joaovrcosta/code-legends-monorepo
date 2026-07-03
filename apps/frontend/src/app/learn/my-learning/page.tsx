import { getMyLearning } from '@/actions/progress'
import { getLessonActivity } from '@/actions/user/get-lesson-activity'
import { getStreak } from '@/actions/user/get-streak'
import { getMySkills } from '@/actions/user/get-my-skills'
import { MyLearningPageContent } from '@/components/learn/my-learning-page-content'

export const dynamic = 'force-dynamic'

export default async function MyLearningPage() {
  const [{ inProgress, completed }, lessonActivity, streak, { skills }] =
    await Promise.all([
      getMyLearning(),
      getLessonActivity({ days: 365 }),
      getStreak(),
      getMySkills(),
    ])

  return (
    <MyLearningPageContent
      initialInProgress={inProgress}
      initialCompleted={completed}
      lessonActivity={lessonActivity?.days ?? []}
      streak={streak}
      skills={skills}
    />
  )
}
