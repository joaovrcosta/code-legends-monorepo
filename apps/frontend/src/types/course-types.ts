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

export type CourseDetailInstructor = {
  id: string;
  name: string;
  avatar: string;
  slug: string | null;
};

export type CourseDetailCategory = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
};

export type CourseDetail = {
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
  instructor: CourseDetailInstructor;
  category: CourseDetailCategory | null;
};

export type CourseDetailResponse = {
  course: CourseDetail;
};
