export type CareerListItem = {
  id: string
  slug: string
  title: string
  description: string | null
  thumbnail: string | null
  icon: string | null
  colorHex: string | null
  modulesCount: number
}

export type ListCareersResponse = {
  careers: CareerListItem[]
}

export type CareerModuleCourse = {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  icon: string | null
  level: string
  kind?: 'CATALOG' | 'PATH_UNIT'
  progress: number
  isEnrolled: boolean
}

export type CareerExam = {
  id: string
  title: string
  slug: string
  passingScore: number
  passed?: boolean
  attemptCount: number
  bestScore: number | null
  lastAttemptAt: string | null
}

export type CareerModule = {
  id: string
  title: string
  description: string | null
  orderIndex: number
  courses: CareerModuleCourse[]
  exams: CareerExam[]
  status: {
    isCompleted: boolean
    completedAt: string | null
    examsPassedCount: number
  }
}

export type GetCareerBySlugResponse = {
  career: {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail: string | null
    icon: string | null
    colorHex: string | null
  }
  modules: CareerModule[]
  enrollment: {
    isEnrolled: boolean
    progress: number
    isCompleted: boolean
    finalExamClearedAt: string | null
    certificateIssued: boolean
    canScheduleFinalExam: boolean
    finalExamRequestPending: boolean
  }
}

export type EnrollCareerResponse = {
  userCareer: {
    id: string
    careerId: string
    userId: string
    progress: number
    isCompleted: boolean
    enrolledAt: string
    lastAccessedAt: string
    completedAt: string | null
  }
}

export type CareerProgressResponse = {
  career: { id: string; progress: number; isCompleted: boolean }
  modules: Array<{
    id: string
    isCompleted: boolean
    completedAt: string | null
    examsPassedCount: number
    examsTotal: number
  }>
}

export type SubmitCareerExamAttemptResponse = {
  success: boolean
  passed: boolean
  score: number
  passingScore: number
  moduleCompleted: boolean
  moduleId?: string
  careerProgress: number
}

