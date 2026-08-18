import { ForumAnswer, ForumQuestion, ForumQuestionStatus } from "@prisma/client";

export type ForumAuthor = {
  id: string;
  name: string;
  avatar: string | null;
};

export type ForumCourseSummary = {
  id: string;
  title: string;
  thumbnail: string | null;
  colorHex: string | null;
};

export type ForumLessonSummary = {
  id: number;
  title: string;
};

export type ForumQuestionWithRelations = ForumQuestion & {
  author: ForumAuthor;
  course: ForumCourseSummary | null;
  lesson: ForumLessonSummary | null;
  _count?: { answers: number };
};

export type ForumAnswerWithAuthor = ForumAnswer & {
  author: ForumAuthor;
};

export type ForumQuestionDetail = ForumQuestionWithRelations & {
  answers: ForumAnswerWithAuthor[];
};

export interface ListForumQuestionsFilters {
  status?: ForumQuestionStatus;
  courseId?: string | null;
  authorId?: string;
  q?: string;
}

export interface CreateForumQuestionData {
  authorId: string;
  courseId?: string | null;
  lessonId?: number | null;
  body: string;
}

export interface CreateForumAnswerData {
  questionId: string;
  authorId: string;
  body: string;
}

export interface IForumQuestionRepository {
  create(data: CreateForumQuestionData): Promise<ForumQuestionWithRelations>;
  findMany(filters: ListForumQuestionsFilters): Promise<ForumQuestionWithRelations[]>;
  findById(id: string): Promise<ForumQuestionDetail | null>;
  createAnswer(data: CreateForumAnswerData): Promise<ForumAnswerWithAuthor>;
  markAsAnswered(id: string): Promise<void>;
  courseExists(courseId: string): Promise<boolean>;
  lessonBelongsToCourse(lessonId: number, courseId: string): Promise<boolean>;
}
