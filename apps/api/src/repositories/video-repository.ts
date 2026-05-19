import { Video } from "@prisma/client";

export interface IVideoRepository {
  create(data: {
    lessonId: number
    url?: string
    duration?: string
    providerId?: string | null
  }): Promise<Video>
  findByLessonId(lessonId: number): Promise<Video | null>
  upsert(
    lessonId: number,
    data: { url?: string; duration?: string; providerId?: string | null },
  ): Promise<Video>
}
