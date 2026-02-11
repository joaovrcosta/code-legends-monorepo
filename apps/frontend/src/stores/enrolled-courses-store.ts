import { create } from "zustand";
import type { EnrolledCourse } from "@/types/user-course.ts";
import { getUserEnrolledList } from "@/actions/progress";

interface EnrolledCoursesStore {
  userCourses: EnrolledCourse[];
  isRefreshing: boolean;
  setUserCourses: (courses: EnrolledCourse[]) => void;
  refreshEnrolledCourses: () => Promise<void>;
  initializeCourses: (courses: EnrolledCourse[]) => void;
}

export const useEnrolledCoursesStore = create<EnrolledCoursesStore>((set) => ({
  userCourses: [],
  isRefreshing: false,
  setUserCourses: (courses) => set({ userCourses: courses }),
  refreshEnrolledCourses: async () => {
    set({ isRefreshing: true });
    try {
      const { userCourses: updatedCourses } = await getUserEnrolledList();
      set({ userCourses: updatedCourses || [] });
    } catch (error) {
      console.error("Erro ao atualizar cursos inscritos:", error);
    } finally {
      set({ isRefreshing: false });
    }
  },
  initializeCourses: (courses) => set({ userCourses: courses }),
}));

