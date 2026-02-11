import { create } from "zustand";

interface ClassroomSidebarState {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const useClassroomSidebarStore = create<ClassroomSidebarState>((set) => ({
  isOpen: true,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useClassroomSidebarStore;
