import { Video } from "@prisma/client";
import { IVideoRepository } from "../video-repository";
import { prisma } from "../../lib/prisma";

export class PrismaVideoRepository implements IVideoRepository {
  async create(data: {
    lessonId: number;
    url?: string;
    duration?: string;
  }): Promise<Video> {
    return prisma.video.create({
      data: {
        lessonId: data.lessonId,
        url: data.url ?? null,
        duration: data.duration ?? null,
      },
    });
  }

  async findByLessonId(lessonId: number): Promise<Video | null> {
    return prisma.video.findUnique({
      where: { lessonId },
    });
  }

  async upsert(
    lessonId: number,
    data: { url?: string; duration?: string }
  ): Promise<Video> {
    return prisma.video.upsert({
      where: { lessonId },
      create: {
        lessonId,
        url: data.url ?? null,
        duration: data.duration ?? null,
      },
      update: {
        url: data.url ?? undefined,
        duration: data.duration ?? undefined,
      },
    });
  }
}
