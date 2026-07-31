'use server'

import { getAuthToken } from '../auth/session'

export type LabAttemptResult = 'pass' | 'fail' | 'timeout' | 'error'

export type LabCodeAttemptSummary = {
  id: string
  stepId: string
  result: string
  createdAt: string
  files: Record<string, string>
}

/** Best-effort: 429/erros não devem afetar o Verificar local. */
export async function createLabCodeAttempt(
  lessonId: number,
  payload: {
    stepId: string
    result: LabAttemptResult
    files: Record<string, string>
  },
): Promise<boolean> {
  const token = await getAuthToken()
  if (!token) return false

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/lab-attempts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    )
    if (response.status === 429) return false
    if (!response.ok) {
      console.error('Erro ao salvar lab attempt', await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('Erro ao salvar lab attempt', error)
    return false
  }
}

export async function listLabCodeAttempts(
  lessonId: number,
  options?: { stepId?: string; take?: number },
): Promise<LabCodeAttemptSummary[]> {
  const token = await getAuthToken()
  if (!token) return []

  const params = new URLSearchParams()
  if (options?.stepId) params.set('stepId', options.stepId)
  if (options?.take) params.set('take', String(options.take))
  const qs = params.toString()

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/lab-attempts${qs ? `?${qs}` : ''}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      },
    )
    if (!response.ok) {
      console.error('Erro ao listar lab attempts', await response.text())
      return []
    }
    const data = (await response.json()) as {
      attempts?: LabCodeAttemptSummary[]
    }
    return data.attempts ?? []
  } catch (error) {
    console.error('Erro ao listar lab attempts', error)
    return []
  }
}
