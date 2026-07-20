import type {
  ChallengeType,
  Challenge,
  ParsonsPiece,
} from '@code-legends/challenges'

export type { ChallengeType, Challenge, ParsonsPiece }

export type LessonStatus = "completed" | "unlocked" | "locked";

export type LessonType = "video" | "article" | "text" | "quiz" | "multi_quiz" | "project" | "lab";

/** Bloco de Code Playground no Markdown (```playground + JSON). */
export interface PlaygroundBlock {
  files?: Record<string, string>;
  template?: 'vanilla' | 'react';
  testFile?: string;
  tests?: Record<string, string>;
  /** Id único para rastrear conclusão (obrigatório se houver testFile). */
  playgroundId?: string;
}

export interface LabStep {
  id: string;
  title: string;
  hint?: string;
  /** Código/resposta esperada; exibido quando o aluno falha o step. */
  expected?: string;
  testFile?: string;
  tests?: Record<string, string>;
}

export interface LabSpecs {
  files?: Record<string, string>;
  template?: 'vanilla' | 'react';
  steps?: LabStep[];
}

export interface LabContent {
  description: string;
  category?: string | null;
  learnTitle?: string | null;
  durationMinutes?: number | null;
  learnBody?: string | null;
  specs?: LabSpecs | null;
}

/**
 * Metadados de aula no GET roadmap (sem conteúdo pesado).
 * Conteúdo completo vem de GET lesson-by-slug → LessonWithContent.
 */
export type RoadmapLesson = {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: LessonType;
  video_duration?: string | null;
  video?: {
    duration?: string | null;
  } | null;
  order: number;
  status: LessonStatus;
  isCurrent: boolean;
  canReview: boolean;
  isFree?: boolean;
  /** XP base estimado (sem challengeCount no roadmap). */
  xpReward?: number;
};

/** Aula com conteúdo completo (player / artigo / quiz / projeto). */
export type LessonWithContent = RoadmapLesson & {
  video_url?: string | null;
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
  lab?: LabContent | null;
};

/** @deprecated Prefer RoadmapLesson (lista) ou LessonWithContent (detalhe). */
export type Lesson = LessonWithContent;

export type Group = {
  id: number;
  title: string;
  slug?: string;
  lessons: RoadmapLesson[];
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
