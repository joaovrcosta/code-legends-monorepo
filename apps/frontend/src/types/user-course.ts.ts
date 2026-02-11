export type Instructor = {
  id: string;
  name: string;
  avatar: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  active: boolean;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  releaseAt: string;
  isFree: boolean;
  subscriptions: number;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  tags: string[];
  description: string;
  instructorId: string;
  categoryId: string | null;
  instructor: Instructor;
  category: unknown | null;
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

export type InstructorWithSlug = {
  id: string;
  name: string;
  avatar: string;
  slug: string | null;
};

export type CourseWithCount = {
  id: string;
  title: string;
  slug: string;
  active: boolean;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  releaseAt: string;
  isFree: boolean;
  subscriptions: number;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  tags: string[];
  description: string;
  instructorId: string;
  categoryId: string | null;
  instructor: InstructorWithSlug;
  category: unknown | null;
  isEnrolled: boolean;
  _count: {
    userCourses: number;
  };
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