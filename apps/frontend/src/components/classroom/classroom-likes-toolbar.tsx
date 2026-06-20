'use client'

import type { ReactNode } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  getLessonReactionStatus,
  toggleLessonDislike,
  toggleLessonLike,
  type ReactionStatus,
} from '@/actions/likes'
import { cn } from '@/lib/utils'

type ClassroomLessonReactionsProps = {
  lessonId?: number
  className?: string
}

const segmentClass =
  'flex h-[42px] items-center justify-center transition-colors hover:bg-white/5 select-none'

function ReactionControl({
  disabled,
  pressed,
  label,
  onActivate,
  className,
  children,
}: {
  disabled: boolean
  pressed: boolean
  label: string
  onActivate: (event: React.MouseEvent) => void
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      onClick={(event) => {
        if (disabled) return
        onActivate(event)
      }}
      onKeyDown={(event) => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          event.stopPropagation()
          onActivate(event as unknown as React.MouseEvent)
        }
      }}
      className={cn(
        segmentClass,
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}

const shellClass =
  'inline-flex items-stretch overflow-hidden rounded-full border border-[#25252A] bg-white/5 shrink-0 transition-colors hover:border-[#00b3e4]/40'

function ReactionsPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(shellClass, 'h-[42px] min-w-[5.75rem] animate-pulse', className)}
      aria-label="Carregando reações desta aula"
      aria-busy="true"
    />
  )
}

export function ClassroomLessonReactions({
  lessonId,
  className,
}: ClassroomLessonReactionsProps) {
  const { status: sessionStatus } = useSession()
  const router = useRouter()
  const [reaction, setReaction] = useState<ReactionStatus>({
    liked: false,
    disliked: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loadedLessonId, setLoadedLessonId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!lessonId) {
      setIsLoading(false)
      setLoadedLessonId(null)
      return
    }

    setIsLoading(true)
    setLoadedLessonId(null)

    if (sessionStatus === 'loading') {
      return
    }

    if (sessionStatus === 'unauthenticated') {
      setReaction({ liked: false, disliked: false })
      setLoadedLessonId(lessonId)
      setIsLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      const status = await getLessonReactionStatus(lessonId)
      if (!cancelled) {
        setReaction(status)
        setLoadedLessonId(lessonId)
        setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [lessonId, sessionStatus])

  const requireAuth = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      if (!lessonId) return false
      if (sessionStatus !== 'authenticated') {
        router.push('/login')
        return false
      }
      return true
    },
    [lessonId, sessionStatus, router],
  )

  const handleLike = useCallback(
    (event: React.MouseEvent) => {
      if (!requireAuth(event) || !lessonId) return

      startTransition(async () => {
        const result = await toggleLessonLike(lessonId, reaction.liked)
        if (result) setReaction(result)
      })
    },
    [requireAuth, lessonId, reaction.liked],
  )

  const handleDislike = useCallback(
    (event: React.MouseEvent) => {
      if (!requireAuth(event) || !lessonId) return

      startTransition(async () => {
        const result = await toggleLessonDislike(lessonId, reaction.disliked)
        if (result) setReaction(result)
      })
    },
    [requireAuth, lessonId, reaction.disliked],
  )

  const disabled = isPending || !lessonId
  const showPlaceholder =
    isLoading ||
    sessionStatus === 'loading' ||
    (lessonId != null && loadedLessonId !== lessonId)

  if (showPlaceholder) {
    return <ReactionsPlaceholder className={className} />
  }

  return (
    <div
      className={cn(
        shellClass,
        disabled && 'opacity-50',
        className,
      )}
      aria-label="Reações desta aula"
    >
      <ReactionControl
        disabled={disabled}
        pressed={reaction.liked}
        label={
          reaction.liked ? 'Remover curtida desta aula' : 'Curtir esta aula'
        }
        onActivate={handleLike}
        className={cn('px-4', reaction.liked && 'text-[#00b3e4]')}
      >
        <ThumbsUp
          size={18}
          strokeWidth={1.75}
          fill={reaction.liked ? 'currentColor' : 'none'}
        />
      </ReactionControl>

      <div className="w-px self-stretch bg-[#25252A]" aria-hidden />

      <ReactionControl
        disabled={disabled}
        pressed={reaction.disliked}
        label={
          reaction.disliked
            ? 'Remover descurtida desta aula'
            : 'Não curtir esta aula'
        }
        onActivate={handleDislike}
        className={cn('px-3.5', reaction.disliked && 'text-[#C4C4CC]')}
      >
        <ThumbsDown
          size={18}
          strokeWidth={1.75}
          fill={reaction.disliked ? 'currentColor' : 'none'}
        />
      </ReactionControl>
    </div>
  )
}

export function ClassroomLikesToolbar({
  lessonId,
  className,
}: {
  lessonId?: number
  courseId?: string
  className?: string
}) {
  return (
    <ClassroomLessonReactions lessonId={lessonId} className={className} />
  )
}
