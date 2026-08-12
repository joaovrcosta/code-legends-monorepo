import { ForumQuestionStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  CreateForumAnswerData,
  CreateForumQuestionData,
  ForumAnswerWithAuthor,
  ForumQuestionDetail,
  ForumQuestionWithRelations,
  IForumQuestionRepository,
  ListForumQuestionsFilters,
} from "../forum-question-repository";

const authorSelect = {
  id: true,
  name: true,
  avatar: true,
} as const;

const courseSelect = {
  id: true,
  title: true,
  thumbnail: true,
  colorHex: true,
} as const;

const lessonSelect = {
  id: true,
  title: true,
} as const;

const questionInclude = {
  author: { select: authorSelect },
  course: { select: courseSelect },
  lesson: { select: lessonSelect },
  _count: { select: { answers: true } },
} satisfies Prisma.ForumQuestionInclude;

export class PrismaForumQuestionRepository implements IForumQuestionRepository {
  async create(data: CreateForumQuestionData): Promise<ForumQuestionWithRelations> {
    return prisma.forumQuestion.create({
      data: {
        authorId: data.authorId,
        courseId: data.courseId ?? null,
        lessonId: data.lessonId ?? null,
        body: data.body,
      },
      include: questionInclude,
    });
  }

  async findMany(
    filters: ListForumQuestionsFilters,
  ): Promise<ForumQuestionWithRelations[]> {
    const where: Prisma.ForumQuestionWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.courseId === null) {
      where.courseId = null;
    } else if (filters.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters.q?.trim()) {
      where.body = {
        contains: filters.q.trim(),
        mode: "insensitive",
      };
    }

    return prisma.forumQuestion.findMany({
      where,
      include: questionInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<ForumQuestionDetail | null> {
    return prisma.forumQuestion.findUnique({
      where: { id },
      include: {
        ...questionInclude,
        answers: {
          include: {
            author: { select: authorSelect },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async createAnswer(data: CreateForumAnswerData): Promise<ForumAnswerWithAuthor> {
    return prisma.forumAnswer.create({
      data: {
        questionId: data.questionId,
        authorId: data.authorId,
        body: data.body,
      },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async markAsAnswered(id: string): Promise<void> {
    await prisma.forumQuestion.update({
      where: { id },
      data: { status: ForumQuestionStatus.ANSWERED },
    });
  }

  async courseExists(courseId: string): Promise<boolean> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    return !!course;
  }

  async lessonBelongsToCourse(
    lessonId: number,
    courseId: string,
  ): Promise<boolean> {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        submodule: {
          module: {
            courseId,
          },
        },
      },
      select: { id: true },
    });
    return !!lesson;
  }
}
