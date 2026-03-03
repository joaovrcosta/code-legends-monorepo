import { Video } from "@prisma/client";

export interface IVideoRepository {
  create(data: { lessonId: number; url?: string; duration?: string }): Promise<Video>;
  findByLessonId(lessonId: number): Promise<Video | null>;
  upsert(lessonId: number, data: { url?: string; duration?: string }): Promise<Video>;
}
