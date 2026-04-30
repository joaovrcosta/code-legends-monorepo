export type Career = {
  id: string
  slug: string
  title: string
  description: string | null
  thumbnail: string | null
  colorHex: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CareerModule = {
  id: string
  careerId: string
  title: string
  description: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
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

