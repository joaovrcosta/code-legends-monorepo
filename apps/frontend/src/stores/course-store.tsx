import { create } from "zustand";
import { SidebarContentProps } from "@/types/course-types";

interface CourseState {
  course: SidebarContentProps | null;
  setCourse: (course: SidebarContentProps) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  course: null,
  setCourse: (course) => set({ course }),
}));
