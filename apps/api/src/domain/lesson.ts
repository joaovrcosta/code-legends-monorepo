export type ChallengeType =
  | "prediction"
  | "bug"
  | "refactor"
  | "complete"
  | "conceptual"
  | "block_slots";

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

export interface ProjectSpecs {
  files?: Record<string, string>;
  template?: string;
  testFile?: string;
  tests?: Record<string, string>;
}

export interface LessonWithContentDTO {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  isFree: boolean;
  order: number;
  video?: {
    url: string | null;
    duration: string | null;
    provider?: {
      id: string;
      slug: string;
      name: string;
      handlerKey: string;
    } | null;
  } | null;
  article?: {
    body: string;
  } | null;
  quiz?: {
    content: Challenge[];
  } | null;
  project?: {
    description: string;
    specs?: ProjectSpecs | null;
  } | null;
}

