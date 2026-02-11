import { create } from "zustand";
import { getActiveCourse } from "@/actions/user/get-active-course";
import type { ActiveCourse } from "@/types/user-course.ts";

interface ActiveCourseStore {
  activeCourse: ActiveCourse | null;
  isLoading: boolean;
  fetchActiveCourse: () => Promise<void>;
  setActiveCourse: (course: ActiveCourse | null) => void;
}

export const useActiveCourseStore = create<ActiveCourseStore>((set) => ({
  activeCourse: null,
  isLoading: false,
  fetchActiveCourse: async () => {
    set({ isLoading: true });
    try {
      const course = await getActiveCourse();
      set({ activeCourse: course, isLoading: false });
    } catch (error) {
      console.error("Erro ao buscar curso ativo:", error);
      set({ activeCourse: null, isLoading: false });
    }
  },
  setActiveCourse: (course) => set({ activeCourse: course }),
}));
