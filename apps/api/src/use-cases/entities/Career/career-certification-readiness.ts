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

function normalizeExamRequestTitle(s: string): string {
  return s
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Detecta se um Request CAREER_FINAL_EXAM se refere a esta carreira. */
export function careerFinalExamRequestMatchesCareer(
  row: { data: string | null; title: string | null },
  careerId: string,
  careerSlug: string,
  careerTitle: string,
): boolean {
  const expectedTitle = `Exame final — ${careerTitle}`
  const rowTitle = row.title?.trim()
  if (rowTitle) {
    if (
      normalizeExamRequestTitle(rowTitle) ===
      normalizeExamRequestTitle(expectedTitle)
    ) {
      return true
    }
  }

  const raw = row.data?.trim()
  if (!raw) {
    return false
  }

  try {
    const j = JSON.parse(raw) as { careerId?: string; careerSlug?: string }
    if (j.careerId && j.careerId === careerId) {
      return true
    }
    if (j.careerSlug && careerSlug && j.careerSlug === careerSlug) {
      return true
    }
  } catch {
    // fallback por substring
  }

  if (raw.includes(careerId)) {
    return true
  }
  if (careerSlug && raw.includes(`"careerSlug":"${careerSlug}"`)) {
    return true
  }
  if (careerSlug && raw.includes(`"careerSlug": "${careerSlug}"`)) {
    return true
  }
  return false
}

export type CareerCertificationReadiness = {
  coursesComplete: boolean
  examsMeetCertRules: boolean
  onlineTrackComplete: boolean
  hasCertificate: boolean
  /** Data em que o exame final foi liberado (UserCareer) ou pedido aprovado (Request APPROVED). */
  finalExamClearedAt: Date | null
  /** Há solicitação em aberto (pendente / em análise legada / rejeitada). */
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
        slug: true,
        title: true,
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
      select: { id: true, finalExamClearedAt: true },
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

  const careerSlug = career.slug ?? ''
  const careerTitle = career.title ?? ''

  const courseIds = [...new Set(career.modules.flatMap((m) => m.courses.map((c) => c.courseId)))]
  const examLinks = career.modules.flatMap((m) => m.exams.map((e) => e.careerExamId))
  const uniqueExamIds = [...new Set(examLinks)]

  const [userCourses, examsMeta, attempts, examRequests] = await Promise.all([
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
        status: { in: ['PENDING', 'IN_PROGRESS', 'REJECTED', 'APPROVED'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { status: true, data: true, title: true, createdAt: true },
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

  const matchesCareer = (r: { data: string | null; title: string | null }) =>
    careerFinalExamRequestMatchesCareer(r, careerId, careerSlug, careerTitle)

  const pendingFinalExamRequest = examRequests.some(
    (r) =>
      (r.status === 'PENDING' || r.status === 'IN_PROGRESS' || r.status === 'REJECTED') &&
      matchesCareer(r),
  )

  const approvedForCareer = examRequests.find(
    (r) => r.status === 'APPROVED' && matchesCareer(r),
  )

  const finalExamClearedAt =
    userCareer.finalExamClearedAt ?? approvedForCareer?.createdAt ?? null

  return {
    coursesComplete,
    examsMeetCertRules,
    onlineTrackComplete: coursesComplete && examsMeetCertRules,
    hasCertificate: certificate != null,
    finalExamClearedAt,
    pendingFinalExamRequest,
  }
}
