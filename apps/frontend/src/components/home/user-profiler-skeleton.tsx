import { Skeleton } from '@/components/ui/skeleton'
import { ActivityCalendar } from './activity-calendar'

function ProfilerMainCardSkeleton() {
  return (
    <div className="bg-surface-2 w-full rounded-[20px] border border-[#25252A] p-6">
      <div className="flex min-h-7 items-start justify-between gap-2">
        <Skeleton className="h-7 w-28 rounded-md" />
        <div className="h-6 w-[3.75rem] shrink-0" aria-hidden />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <Skeleton className="h-[44px] w-full rounded-full" />
      </div>

      <div className="mt-6">
        <Skeleton className="h-4 w-16 rounded-md" />
        <div className="mt-2 flex items-center gap-4">
          <Skeleton className="h-[2px] w-full rounded-full" />
          <Skeleton className="h-4 w-10 shrink-0 rounded-md" />
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Skeleton className="h-5 w-3 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      </div>

      <div className="mt-6 w-full">
        <ActivityCalendar activities={null} />
      </div>

      <div className="mt-6 flex items-center justify-between py-4">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
      </div>
    </div>
  )
}

function ProfilerStreakCardSkeleton() {
  return (
    <div className="w-full rounded-[20px] border border-[#25252A] bg-surface-2 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-9 w-10 rounded-md" />
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>
      <Skeleton className="mt-2 h-3 w-full max-w-[240px] rounded-md" />
    </div>
  )
}

export function UserProfilerSkeleton() {
  return (
    <div
      className="relative z-10 mb-6 mt-0 flex h-fit w-full flex-shrink-0 flex-col gap-8 self-stretch lg:mb-0 lg:mt-9 lg:max-w-[360px] lg:sticky lg:top-[32px]"
      aria-busy
      aria-label="A carregar perfil"
    >
      <ProfilerMainCardSkeleton />
      <ProfilerStreakCardSkeleton />
    </div>
  )
}
