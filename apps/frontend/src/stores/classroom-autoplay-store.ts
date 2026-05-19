import { create } from 'zustand'

const STORAGE_KEY = 'code-legends-classroom-autoplay'

interface ClassroomAutoplayStore {
  isAutoplayEnabled: boolean
  hydrated: boolean
  /** Próxima aula de vídeo deve iniciar automaticamente após navegação em cadeia. */
  pendingVideoAutoplay: boolean
  hydrate: () => void
  setAutoplayEnabled: (enabled: boolean) => void
  setPendingVideoAutoplay: (pending: boolean) => void
}

export const useClassroomAutoplayStore = create<ClassroomAutoplayStore>((set) => ({
  isAutoplayEnabled: false,
  hydrated: false,
  pendingVideoAutoplay: false,

  hydrate: () => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY) === 'true'
      set({ isAutoplayEnabled: stored, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  setAutoplayEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, String(enabled))
      } catch {
        /* ignore */
      }
    }
    set({ isAutoplayEnabled: enabled })
  },

  setPendingVideoAutoplay: (pending) => set({ pendingVideoAutoplay: pending }),
}))
