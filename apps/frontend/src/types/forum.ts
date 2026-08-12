export type ForumQuestionStatus = "WAITING_ANSWER" | "ANSWERED";

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

export type ForumQuestionListItem = {
  id: string;
  authorId: string;
  courseId: string | null;
  lessonId: number | null;
  body: string;
  preview: string;
  status: ForumQuestionStatus;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
  course: ForumCourseSummary | null;
  lesson: ForumLessonSummary | null;
  _count?: { answers: number };
};

export type ForumAnswer = {
  id: string;
  questionId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
};

export type ForumQuestionDetail = Omit<ForumQuestionListItem, "preview"> & {
  answers: ForumAnswer[];
};
