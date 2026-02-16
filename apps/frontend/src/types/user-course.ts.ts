import type { CourseDTO, UserPublicDTO } from "@code-legends/shared-types";

export type { CourseDTO, UserPublicDTO } from "@code-legends/shared-types";

export type Instructor = Omit<UserPublicDTO, "createdAt" | "updatedAt"> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Course = Omit<CourseDTO, "createdAt" | "updatedAt" | "releaseAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  releaseAt: string | Date | null;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail: string;
  icon: string;
};

export type FavoriteCourse = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  course: Course;
};

export type UserCoursesResponse = {
  favoriteCourses: FavoriteCourse[];
};

export type EnrolledCourse = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  isCompleted: boolean;
  completedAt: string | null;
  currentModuleId: string;
  currentTaskId: number;
  progress: number;
  course: Course;
};

export type UserEnrolledListResponse = {
  userCourses: EnrolledCourse[];
};

export type InstructorWithSlug = UserPublicDTO;

export type CourseWithCount = CourseDTO & {
  isEnrolled: boolean;
};

export type CoursesListResponse = {
  courses: CourseWithCount[];
};

export type ActiveCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  description: string;
  progress: number;
  isCompleted: boolean;
  currentModuleId: string;
  currentTaskId: number;
  icon: string;
};

export type ActiveCourseResponse = {
  course: ActiveCourse;
};

export type CompletedCourse = {
  id: string;
  certificateId: string;
  title: string;
  icon: string;
  progress: number;
  completedAt: string;
};

export type CompletedCoursesResponse = {
  courses: CompletedCourse[];
};

export interface ModuleProgress {
  id: string;
  title: string;
  slug: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  isCompleted: boolean;
}

export interface CourseProgressData {
  id: string;
  title: string;
  slug: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalModules: number;
  completedModules: number;
  isCompleted: boolean;
}

export interface UserCourseProgressResponse {
  course: CourseProgressData;
  modules: ModuleProgress[];
}