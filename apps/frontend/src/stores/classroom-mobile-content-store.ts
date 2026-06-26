import { create } from 'zustand'

interface ClassroomMobileContentState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useClassroomMobileContentStore = create<ClassroomMobileContentState>(
  (set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  }),
)
