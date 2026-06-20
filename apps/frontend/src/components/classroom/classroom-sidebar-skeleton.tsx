'use client'

import { Skeleton } from '@/components/skeleton'

export function ClassroomSidebarSkeleton() {
  return (
    <div className="space-y-4 px-3 py-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="space-y-3 border-b border-zinc-900 pb-4 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton
              variant="circular"
              width={44}
              height={44}
              className="shrink-0 dark:bg-zinc-800"
            />
            <div className="flex-1 space-y-2">
              <Skeleton
                variant="text"
                width="30%"
                className="h-3 dark:bg-zinc-800"
              />
              <Skeleton
                variant="text"
                width="70%"
                className="h-4 dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="pl-11 space-y-2">
            <Skeleton
              variant="text"
              width="100%"
              className="h-3 dark:bg-zinc-800"
            />
            <Skeleton
              variant="text"
              width="90%"
              className="h-3 dark:bg-zinc-800"
            />
            <Skeleton
              variant="text"
              width="95%"
              className="h-3 dark:bg-zinc-800"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
