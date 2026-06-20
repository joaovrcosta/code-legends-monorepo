import { create } from 'zustand'

interface ClassroomSidebarState {
  isOpen: boolean
  toggleSidebar: () => void
  openModuleIds: string[]
  accordionCourseId: string | null
  setOpenModuleIds: (ids: string[]) => void
  ensureModuleOpen: (moduleValue: string) => void
  resetAccordionForCourse: (courseId: string | null) => void
}

const useClassroomSidebarStore = create<ClassroomSidebarState>((set, get) => ({
  isOpen: true,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  openModuleIds: [],
  accordionCourseId: null,
  setOpenModuleIds: (ids) => set({ openModuleIds: ids }),
  ensureModuleOpen: (moduleValue) => {
    const { openModuleIds } = get()
    if (openModuleIds.includes(moduleValue)) return
    set({ openModuleIds: [...openModuleIds, moduleValue] })
  },
  resetAccordionForCourse: (courseId) => {
    if (get().accordionCourseId === courseId) return
    set({ accordionCourseId: courseId, openModuleIds: [] })
  },
}))

export default useClassroomSidebarStore
