import type {
  ChallengeType,
  Challenge,
  ParsonsPiece,
} from '@code-legends/challenges'

export type { ChallengeType, Challenge, ParsonsPiece }

export interface ProjectSpecs {
  files?: Record<string, string>;
  template?: string;
  testFile?: string;
  tests?: Record<string, string>;
}

export interface LabStep {
  id: string;
  title: string;
  hint?: string;
  /** Pergunta amigável; exibida quando o aluno falha o step. */
  expected?: string;
  testFile?: string;
  tests?: Record<string, string>;
}

export interface LabSpecs {
  files?: Record<string, string>;
  template?: string;
  steps?: LabStep[];
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
  lab?: {
    description: string;
    category?: string | null;
    learnTitle?: string | null;
    durationMinutes?: number | null;
    learnBody?: string | null;
    specs?: LabSpecs | null;
  } | null;
  xpReward?: number;
}

