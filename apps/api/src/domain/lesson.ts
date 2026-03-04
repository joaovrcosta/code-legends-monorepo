export type ChallengeType =
  | "prediction"
  | "bug"
  | "refactor"
  | "complete"
  | "conceptual";

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
  } | null;
  article?: {
    body: string;
  } | null;
  quiz?: {
    content: Challenge[];
  } | null;
}

