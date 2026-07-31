'use server'

import { getAuthToken } from '../auth/session'

export type LabProgressState = {
  completedStepIds: string[]
  currentStepId: string
  completedCount?: number
  currentStepIndex?: number
  files?: Record<string, string>
  filesUpdatedAt?: string
}

export async function getLabProgress(
  lessonId: number,
): Promise<LabProgressState | null> {
  const token = await getAuthToken()
  if (!token) return null

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/lab-progress`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    if (response.status === 401 || response.status === 404) return null
    console.error('Erro ao buscar lab progress', await response.text())
    return null
  }

  const data = (await response.json()) as {
    labProgress?: LabProgressState | null
  }
  return data.labProgress ?? null
}

export async function saveLabProgress(
  lessonId: number,
  progress: LabProgressState,
): Promise<LabProgressState | null> {
  const token = await getAuthToken()
  if (!token) return null

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/lab-progress`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(progress),
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    if (response.status === 429) return null
    console.error('Erro ao salvar lab progress', await response.text())
    return null
  }

  const data = (await response.json()) as {
    labProgress?: LabProgressState | null
  }
  return data.labProgress ?? progress
}
