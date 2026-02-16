interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  slug: string;
  url: string | null;
  video_url: string | null;
  video_duration: string | null;
  locked: boolean;
  completed: boolean;
  submoduleId: number;
  order: number;
  createdAt: Date;
}

interface Submodule {
  id: number;
  name: string;
  moduleId: number;
  tasks: Task[];
}

interface Module {
  id: number;
  nivel: string;
  name: string;
  courseId: number;
  submodules: Submodule[];
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  modules: Module[];
}

export interface SidebarContentProps {
  course: Course;
}

import type { UserPublicDTO, CategoryDTO, CourseDTO } from "@code-legends/shared-types";

export type CourseDetailInstructor = Omit<UserPublicDTO, "createdAt" | "updatedAt"> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type CourseDetailCategory = CategoryDTO & {
  description?: string;
  order?: number;
  active?: boolean;
};

export type CourseDetail = Omit<CourseDTO, "createdAt" | "updatedAt" | "releaseAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  releaseAt: string | Date | null;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail: string;
};

export type CourseDetailResponse = {
  course: CourseDetail;
};
