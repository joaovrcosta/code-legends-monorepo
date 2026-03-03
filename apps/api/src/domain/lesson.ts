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
}

