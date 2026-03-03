import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IVideoRepository } from "../../../repositories/video-repository";
import { IArticleRepository } from "../../../repositories/article-repository";
import { LessonNotFoundError } from "../../errors/lesson-not-found";
import { LessonAlreadyExistsError } from "../../errors/lesson-already-exists";

interface UpdateLessonRequest {
  id: number;
  title?: string;
  description?: string;
  type?: string;
  slug?: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  body?: string;
  locked?: boolean;
  order?: number;
}

interface UpdateLessonResponse {
  lesson: Lesson;
}

export class UpdateLessonUseCase {
  constructor(
    private lessonRepository: ILessonRepository,
    private videoRepository: IVideoRepository,
    private articleRepository: IArticleRepository
  ) {}

  async execute(data: UpdateLessonRequest): Promise<UpdateLessonResponse> {
    const lesson = await this.lessonRepository.findById(data.id);
    if (!lesson) {
      throw new LessonNotFoundError();
    }

    if (data.slug && data.slug !== lesson.slug) {
      const lessonWithSameSlug = await this.lessonRepository.findBySlugAndSubmoduleId(
        data.slug,
        lesson.submoduleId
      );
      if (lessonWithSameSlug) {
        throw new LessonAlreadyExistsError();
      }
    }

    const { video_url, video_duration, body, ...updateData } = data;
    const updatedLesson = await this.lessonRepository.update(data.id, updateData);

    if (data.type === "video") {
      await this.videoRepository.upsert(lesson.id, {
        url: video_url,
        duration: video_duration,
      });
    }
    if (data.type === "article" && body != null) {
      await this.articleRepository.upsert(lesson.id, {
        body: body.trim() || " ",
      });
    }

    const lessonWithContent = await this.lessonRepository.findById(data.id);
    return {
      lesson: lessonWithContent ?? updatedLesson,
    };
  }
}
