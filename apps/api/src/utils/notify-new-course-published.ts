import { prisma } from '../lib/prisma'
import { NotificationBuilder } from './notification-builder'
import { createNotificationsBatch } from './create-notification'

type NewCourseNotificationInput = {
  id: string
  title: string
  slug: string
  instructorId: string
}

export async function notifyUsersAboutNewCoursePublished(
  course: NewCourseNotificationInput,
): Promise<void> {
  const instructor = await prisma.user.findUnique({
    where: { id: course.instructorId },
    select: { name: true },
  })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const users = await prisma.user.findMany({
    where: {
      lastLogin: {
        gte: thirtyDaysAgo,
      },
    },
    select: { id: true },
  })

  if (users.length === 0) {
    return
  }

  const notifications = users.map((user) =>
    NotificationBuilder.createNewCourseNotification(user.id, {
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      instructorName: instructor?.name,
    }),
  )

  await createNotificationsBatch(notifications)
}

export function scheduleNewCoursePublishedNotification(
  course: NewCourseNotificationInput,
): void {
  setImmediate(async () => {
    try {
      await notifyUsersAboutNewCoursePublished(course)
    } catch (error) {
      console.error('Erro ao criar notificações de novo curso:', {
        courseId: course.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  })
}
