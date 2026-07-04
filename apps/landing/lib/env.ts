function normalizeUrl(value: string | undefined, fallback: string): string {
  const raw = value?.trim() || fallback;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3002",
);

export const appUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
);

export function appPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${appUrl}${normalized}`;
}
