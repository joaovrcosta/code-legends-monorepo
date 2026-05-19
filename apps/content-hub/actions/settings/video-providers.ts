'use server'

import { revalidatePath } from 'next/cache'
import { getAuthToken } from '@/actions/auth'
import { getApiBaseUrl } from '@/lib/api-base-url'

export type VideoProviderDto = {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'DEPRECATED' | 'DISABLED'
  isDefault: boolean
  isBuiltin: boolean
  handlerKey: string
  urlPlaceholder: string
  helpText: string | null
  allowedDomains: string[]
  sortOrder: number
  _count?: { videos: number }
}

async function apiFetch(path: string, init?: RequestInit) {
  const token = await getAuthToken()
  if (!token) throw new Error('Não autenticado')

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  const body = await response.json().catch(() => ({})) as {
    message?: string
    issues?: Array<{ message?: string }>
  }
  if (!response.ok) {
    const detail =
      body.message ??
      body.issues?.map((i) => i.message).filter(Boolean).join(', ') ??
      `Erro na API (${response.status})`
    throw new Error(detail)
  }
  return body
}

export async function listVideoProviders(options?: {
  includeDeprecated?: boolean
}): Promise<{ providers: VideoProviderDto[] }> {
  const q = options?.includeDeprecated ? '?includeDeprecated=true' : ''
  return apiFetch(`/video-providers${q}`)
}

export async function listActiveVideoProviders(): Promise<{
  providers: VideoProviderDto[]
}> {
  return apiFetch('/video-providers/active')
}

export async function createVideoProvider(input: {
  name: string
  allowedDomains: string[]
  urlPlaceholder?: string
  helpText?: string | null
}): Promise<{ provider: VideoProviderDto }> {
  const result = await apiFetch('/video-providers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  revalidatePath('/settings/video-providers')
  return result
}

export async function updateVideoProvider(
  id: string,
  input: {
    name?: string
    allowedDomains?: string[]
    urlPlaceholder?: string
    helpText?: string | null
    sortOrder?: number
  },
): Promise<{ provider: VideoProviderDto }> {
  const result = await apiFetch(`/video-providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  revalidatePath('/settings/video-providers')
  return result
}

export async function setDefaultVideoProvider(
  id: string,
): Promise<{ provider: VideoProviderDto }> {
  const result = await apiFetch(`/video-providers/${id}/default`, {
    method: 'PATCH',
  })
  revalidatePath('/settings/video-providers')
  return result
}

export async function setVideoProviderStatus(
  id: string,
  status: 'ACTIVE' | 'DEPRECATED' | 'DISABLED',
): Promise<{ provider: VideoProviderDto }> {
  const result = await apiFetch(`/video-providers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  revalidatePath('/settings/video-providers')
  return result
}
