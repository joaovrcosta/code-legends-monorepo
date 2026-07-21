'use client'

import {
  createContext,
  useCallback,
  useRef,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface ArticlePlaygroundContextValue {
  registerPlayground: (playgroundId: string | undefined, hasTests: boolean) => string
  completedIds: Set<string>
  reportTestsPassed: (playgroundId: string) => void
  allPlaygroundsPassed: boolean
  hasRequiredPlaygrounds: boolean
}

const ArticlePlaygroundContext = createContext<ArticlePlaygroundContextValue | null>(null)

export function ArticlePlaygroundProvider({ children }: { children: ReactNode }) {
  const [requiredIds, setRequiredIds] = useState<Set<string>>(() => new Set())
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set())
  const nextIndexRef = useRef(0)

  const registerPlayground = useCallback((playgroundId: string | undefined, hasTests: boolean) => {
    if (!hasTests) return playgroundId ?? ''
    const id = playgroundId ?? `playground-${nextIndexRef.current++}`
    setRequiredIds((prev) => new Set([...prev, id]))
    return id
  }, [])

  const reportTestsPassed = useCallback((playgroundId: string) => {
    setCompletedIds((prev) => new Set([...prev, playgroundId]))
  }, [])

  const allPlaygroundsPassed =
    requiredIds.size === 0 || [...requiredIds].every((id) => completedIds.has(id))
  const hasRequiredPlaygrounds = requiredIds.size > 0

  const value = useMemo<ArticlePlaygroundContextValue>(
    () => ({
      registerPlayground,
      completedIds,
      reportTestsPassed,
      allPlaygroundsPassed,
      hasRequiredPlaygrounds,
    }),
    [registerPlayground, completedIds, reportTestsPassed, allPlaygroundsPassed, hasRequiredPlaygrounds, requiredIds.size],
  )

  return (
    <ArticlePlaygroundContext.Provider value={value}>
      {children}
    </ArticlePlaygroundContext.Provider>
  )
}

export function useArticlePlayground(): ArticlePlaygroundContextValue | null {
  return useContext(ArticlePlaygroundContext)
}
