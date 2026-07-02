export type Career = {
  id: string
  slug: string
  title: string
  description: string | null
  longDescription: string | null
  thumbnail: string | null
  icon: string | null
  colorHex: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CareerModuleCourseLink = {
  id: string
  courseId: string
  orderIndex: number
  course: { id: string; title: string; slug: string }
}

export type CareerModule = {
  id: string
  careerId: string
  title: string
  description: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
  /** Presente na listagem admin GET /admin/careers */
  courses?: CareerModuleCourseLink[]
}

export type CareerExam = {
  id: string
  careerId: string
  slug: string
  title: string
  description: string | null
  content: unknown
  passingScore: number
  maxAttempts: number | null
  createdAt: string
  updatedAt: string
}

