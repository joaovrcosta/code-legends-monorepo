import { prisma } from '../../../lib/prisma'

/** Nota mínima global (%) para contar exame como válido na certificação, além do passingScore do exame. */
export const CAREER_CERT_MIN_SCORE = 70

export const CAREER_FINAL_EXAM_REQUEST_TYPE = 'CAREER_FINAL_EXAM' as const

export function isUserCourseFullyComplete(uc: {
  progress: number
  isCompleted: boolean
} | null | undefined): boolean {
  if (!uc) return false
  if (uc.isCompleted) return true
  const p = uc.progress
  if (p >= 1 && p < 2) return true
  if (p >= 100) return true
  return false
}

export function examScoreMeetsCertification(score: number, passingScore: number): boolean {
  return score >= CAREER_CERT_MIN_SCORE && score >= passingScore
}

export type CareerCertificationReadiness = {
  coursesComplete: boolean
  examsMeetCertRules: boolean
  onlineTrackComplete: boolean
  hasCertificate: boolean
  finalExamClearedAt: Date | null
  pendingFinalExamRequest: boolean
}

/**
 * Regras: todos os cursos vinculados aos módulos da carreira 100%;
 * cada exame da carreira com última tentativa com nota >= 70 e >= passingScore.
 */
export async function evaluateCareerCertificationReadiness(
  userId: string,
  careerId: string,
): Promise<CareerCertificationReadiness> {
  const [career, userCareer, certificate] = await Promise.all([
    prisma.career.findUnique({
      where: { id: careerId },
      select: {
        modules: {
          select: {
            id: true,
            courses: { select: { courseId: true } },
            exams: { select: { careerExamId: true } },
          },
        },
      },
    }),
    prisma.userCareer.findUnique({
      where: { userId_careerId: { userId, careerId } },
      // finalExamClearedAt: após migration — `npx prisma generate`
      select: { id: true, finalExamClearedAt: true } as { id: true; finalExamClearedAt: true },
    }),
    prisma.certificate.findFirst({
      where: { userId, careerId },
      select: { id: true },
    }),
  ])

  if (!career || !userCareer) {
    return {
      coursesComplete: false,
      examsMeetCertRules: false,
      onlineTrackComplete: false,
      hasCertificate: certificate != null,
      finalExamClearedAt: null,
      pendingFinalExamRequest: false,
    }
  }

  const courseIds = [...new Set(career.modules.flatMap((m) => m.courses.map((c) => c.courseId)))]
  const examLinks = career.modules.flatMap((m) => m.exams.map((e) => e.careerExamId))
  const uniqueExamIds = [...new Set(examLinks)]

  const [userCourses, examsMeta, attempts, pendingRows] = await Promise.all([
    courseIds.length
      ? prisma.userCourse.findMany({
        where: { userId, courseId: { in: courseIds } },
        select: { courseId: true, progress: true, isCompleted: true },
      })
      : [],
    uniqueExamIds.length
      ? prisma.careerExam.findMany({
        where: { id: { in: uniqueExamIds } },
        select: { id: true, passingScore: true },
      })
      : [],
    uniqueExamIds.length
      ? prisma.userCareerExamAttempt.findMany({
        where: {
          userId,
          userCareerId: userCareer.id,
          careerExamId: { in: uniqueExamIds },
        },
        orderBy: { createdAt: 'desc' },
        select: { careerExamId: true, score: true },
      })
      : [],
    prisma.request.findMany({
      where: {
        userId,
        type: CAREER_FINAL_EXAM_REQUEST_TYPE,
        status: 'PENDING',
      },
      select: { data: true },
    }),
  ])

  const ucMap = new Map(userCourses.map((u) => [u.courseId, u]))
  let coursesComplete = true
  for (const cid of courseIds) {
    if (!isUserCourseFullyComplete(ucMap.get(cid))) {
      coursesComplete = false
      break
    }
  }
  if (courseIds.length === 0) {
    coursesComplete = true
  }

  const latestScoreByExam = new Map<string, number>()
  for (const a of attempts) {
    if (!latestScoreByExam.has(a.careerExamId)) {
      latestScoreByExam.set(a.careerExamId, a.score)
    }
  }

  const passingByExam = new Map(examsMeta.map((e) => [e.id, e.passingScore]))
  let examsMeetCertRules = true
  for (const examId of uniqueExamIds) {
    const score = latestScoreByExam.get(examId)
    const passing = passingByExam.get(examId) ?? 70
    if (score == null || !examScoreMeetsCertification(score, passing)) {
      examsMeetCertRules = false
      break
    }
  }
  if (uniqueExamIds.length === 0) {
    examsMeetCertRules = true
  }

  const pendingFinalExamRequest = pendingRows.some((r) => {
    if (!r.data) return false
    try {
      const j = JSON.parse(r.data) as { careerId?: string }
      return j.careerId === careerId
    } catch {
      return r.data.includes(careerId)
    }
  })

  return {
    coursesComplete,
    examsMeetCertRules,
    onlineTrackComplete: coursesComplete && examsMeetCertRules,
    hasCertificate: certificate != null,
    finalExamClearedAt: (userCareer as { finalExamClearedAt?: Date | null }).finalExamClearedAt ?? null,
    pendingFinalExamRequest,
  }
}
