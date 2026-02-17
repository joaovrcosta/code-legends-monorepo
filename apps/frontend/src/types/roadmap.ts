export type LessonStatus = "completed" | "unlocked" | "locked";

export type LessonType = "video" | "article" | "quiz" | "project";

export type Lesson = {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: LessonType;
  video_url: string;
  video_duration: string;
  order: number;
  status: LessonStatus;
  isCurrent: boolean;
  canReview: boolean;
};

export type Group = {
  id: number;
  title: string;
  slug?: string;
  lessons: Lesson[];
};

export type Module = {
  id: string;
  title: string;
  slug: string;
  groups: Group[];
  progress: number;
  isCompleted: boolean;
};

export type CourseAuthor = {
  name: string;
  id?: number;
  avatar?: string;
  role?: string;
};

export type CourseRoadmap = {
  id: string;
  title: string;
  slug: string;
  progress: number;
  isCompleted: boolean;
  author?: CourseAuthor;
  currentModule?: number;
  currentClass?: number;
  nextModule?: number;
  currentModuleId?: string;
  totalModules?: number;
  canUnlockNextModule?: boolean;
  isLastLessonCompleted?: boolean;
};

export type CurrentLesson = {
  id: number;
  title: string;
  duration: string | null;
  progress: number;
};

export type RoadmapResponse = {
  course: CourseRoadmap;
  currentLesson?: CurrentLesson | null;
  modules: Module[];
};

export type ModuleWithProgress = {
  id: string;
  title: string;
  slug: string;
  courseId: string;
  progress: number;
  active: boolean;
  isCurrent: boolean;
  totalLessons: number;
  completedLessons: number;
  locked: boolean;
  canUnlock: boolean;
};

export type ModulesWithProgressResponse = {
  modules: ModuleWithProgress[];
  nextModule?: ModuleWithProgress;
};
