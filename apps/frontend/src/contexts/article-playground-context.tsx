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
  /** Regista um playground que exige testes. Retorna o id a usar (ou gera um se não passado). */
  registerPlayground: (playgroundId: string | undefined, hasTests: boolean) => string
  /** Ids dos playgrounds que já passaram nos testes. */
  completedIds: Set<string>
  /** Marca o playground como concluído (testes passaram). */
  reportTestsPassed: (playgroundId: string) => void
  /** True se não há playgrounds com testes ou se todos já passaram. */
  allPlaygroundsPassed: boolean
  /** True se existe pelo menos um playground no artigo que exige testes. */
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
