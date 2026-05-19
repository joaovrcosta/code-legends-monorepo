export type LessonStatus = "completed" | "unlocked" | "locked";

export type LessonType = "video" | "article" | "text" | "quiz" | "multi_quiz" | "project";

export type ChallengeType =
  | "prediction"
  | "bug"
  | "refactor"
  | "complete"
  | "conceptual"
  | "block_slots"
  | "exam_mcq";

export interface ParsonsPiece {
  id: string;
  content: string;
}

export interface Challenge {
  type: ChallengeType;
  question: string;
  code?: string;
  language?: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
  placeholder?: string;
  pieces?: ParsonsPiece[];
  solution?: string[];
  missionImageUrl?: string;
}

/** Bloco de Code Playground no Markdown (```playground + JSON). */
export interface PlaygroundBlock {
  files?: Record<string, string>;
  template?: 'vanilla' | 'react';
  testFile?: string;
  tests?: Record<string, string>;
  /** Id único para rastrear conclusão (obrigatório se houver testFile). */
  playgroundId?: string;
}

export type Lesson = {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: LessonType;
  video_url?: string | null;
  video_duration?: string | null;
  video?: {
    url?: string | null;
    duration?: string | null;
    provider?: {
      id: string;
      slug: string;
      name: string;
      handlerKey: string;
    } | null;
  } | null;
  article?: { body: string } | null;
  quiz?: { content: Challenge[] } | null;
  project?: { description: string; specs?: PlaygroundBlock | null } | null;
  order: number;
  status: LessonStatus;
  isCurrent: boolean;
  canReview: boolean;
  isFree?: boolean;
  /** XP estimado ao concluir a aula (primeira vez). */
  xpReward?: number;
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
  isFree?: boolean;
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
  description?: string;
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
