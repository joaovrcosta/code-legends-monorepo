export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    'http://127.0.0.1:3333'

  return raw.replace(/\/$/, '')
}
