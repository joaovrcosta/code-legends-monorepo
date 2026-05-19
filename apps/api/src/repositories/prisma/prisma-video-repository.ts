import { Video } from "@prisma/client";
import { IVideoRepository } from "../video-repository";
import { prisma } from "../../lib/prisma";

export class PrismaVideoRepository implements IVideoRepository {
  async create(data: {
    lessonId: number
    url?: string
    duration?: string
    providerId?: string | null
  }): Promise<Video> {
    return prisma.video.create({
      data: {
        lessonId: data.lessonId,
        url: data.url ?? null,
        duration: data.duration ?? null,
        providerId: data.providerId ?? null,
      },
    })
  }

  async findByLessonId(lessonId: number): Promise<Video | null> {
    return prisma.video.findUnique({
      where: { lessonId },
    });
  }

  async upsert(
    lessonId: number,
    data: { url?: string; duration?: string; providerId?: string | null },
  ): Promise<Video> {
    return prisma.video.upsert({
      where: { lessonId },
      create: {
        lessonId,
        url: data.url ?? null,
        duration: data.duration ?? null,
        providerId: data.providerId ?? null,
      },
      update: {
        url: data.url ?? undefined,
        duration: data.duration ?? undefined,
        providerId:
          data.providerId !== undefined ? data.providerId : undefined,
      },
    })
  }
}
