/**
 * Fallback leve enquanto o App Shell resolve dados no servidor (streaming).
 */
export function AppShellStreamingFallback({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div
        className="h-14 shrink-0 border-b bg-muted/40 motion-safe:animate-pulse"
        aria-hidden
      />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
