import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
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
  locked?: boolean;
  order?: number;
}

interface UpdateLessonResponse {
  lesson: Lesson;
}

export class UpdateLessonUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute(data: UpdateLessonRequest): Promise<UpdateLessonResponse> {
    // Verificar se a lição existe
    const lesson = await this.lessonRepository.findById(data.id);

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    // Se está alterando o slug, verificar se não existe outra lição com o mesmo slug neste submódulo
    if (data.slug && data.slug !== lesson.slug) {
      const lessonWithSameSlug = await this.lessonRepository.findBySlugAndSubmoduleId(
        data.slug,
        lesson.submoduleId
      );

      if (lessonWithSameSlug) {
        throw new LessonAlreadyExistsError();
      }
    }

    const updatedLesson = await this.lessonRepository.update(data.id, {
      title: data.title,
      description: data.description,
      type: data.type,
      slug: data.slug,
      url: data.url,
      isFree: data.isFree,
      video_url: data.video_url,
      video_duration: data.video_duration,
      locked: data.locked,
      order: data.order,
    });

    return {
      lesson: updatedLesson,
    };
  }
}
