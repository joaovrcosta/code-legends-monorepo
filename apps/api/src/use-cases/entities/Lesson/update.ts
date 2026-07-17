import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IVideoRepository } from "../../../repositories/video-repository";
import { IVideoProviderRepository } from "../../../repositories/video-provider-repository";
import { resolveLessonVideoInput } from "../../../lib/resolve-lesson-video";
import { InvalidVideoUrlForProviderError } from "../../errors/invalid-video-url-for-provider";
import { IArticleRepository } from "../../../repositories/article-repository";
import { IQuizRepository } from "../../../repositories/quiz-repository";
import { IProjectRepository } from "../../../repositories/project-repository";
import { ILabRepository } from "../../../repositories/lab-repository";
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
  video_provider_id?: string;
  body?: string;
  quiz_content?: unknown[];
  project_description?: string;
  project_specs?: unknown;
  lab_description?: string;
  lab_category?: string | null;
  lab_learn_title?: string | null;
  lab_duration_minutes?: number | null;
  lab_learn_body?: string | null;
  lab_specs?: unknown;
  locked?: boolean;
  order?: number;
}

interface UpdateLessonResponse {
  lesson: Lesson;
  videoWarnings?: string[];
}

export class UpdateLessonUseCase {
  constructor(
    private lessonRepository: ILessonRepository,
    private videoRepository: IVideoRepository,
    private videoProviderRepository: IVideoProviderRepository,
    private articleRepository: IArticleRepository,
    private quizRepository: IQuizRepository,
    private projectRepository: IProjectRepository,
    private labRepository: ILabRepository
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

    const {
      video_url,
      video_duration,
      video_provider_id,
      body,
      quiz_content,
      project_description,
      project_specs,
      lab_description,
      lab_category,
      lab_learn_title,
      lab_duration_minutes,
      lab_learn_body,
      lab_specs,
      ...updateData
    } = data;
    const updatedLesson = await this.lessonRepository.update(data.id, updateData);

    let videoWarnings: string[] | undefined;

    const lessonType = String(data.type ?? lesson.type).toLowerCase();
    const touchesVideoFields =
      video_url !== undefined ||
      video_duration !== undefined ||
      video_provider_id !== undefined;

    if (lessonType === "video" && touchesVideoFields) {
      const existingVideo = await this.videoRepository.findByLessonId(lesson.id);

      const urlChanged =
        video_url !== undefined &&
        (video_url?.trim() ?? "") !== (existingVideo?.url?.trim() ?? "");
      const durationChanged =
        video_duration !== undefined &&
        (video_duration ?? "") !== (existingVideo?.duration ?? "");
      const providerChanged =
        video_provider_id !== undefined &&
        (video_provider_id ?? null) !== (existingVideo?.providerId ?? null);

      if (urlChanged || durationChanged || providerChanged) {
        const urlToValidate =
          video_url !== undefined ? video_url : existingVideo?.url ?? undefined;
        const providerIdToUse =
          video_provider_id !== undefined
            ? video_provider_id
            : existingVideo?.providerId ?? undefined;

        try {
          const resolved = await resolveLessonVideoInput({
            videoUrl: urlToValidate,
            videoProviderId: providerIdToUse,
            videoProviderRepository: this.videoProviderRepository,
            requireUrl: false,
          });
          await this.videoRepository.upsert(lesson.id, {
            url: resolved.url ?? existingVideo?.url ?? null,
            duration:
              video_duration !== undefined
                ? video_duration
                : existingVideo?.duration ?? undefined,
            providerId: resolved.provider.id,
          });
        } catch (error) {
          if (error instanceof InvalidVideoUrlForProviderError) {
            videoWarnings = error.details;
          } else {
            throw error;
          }
        }
      }
    }
    if (data.type === "article" && body != null) {
      await this.articleRepository.upsert(lesson.id, {
        body: body.trim() || " ",
      });
    }
    if (
      (data.type === "quiz" || data.type === "multi_quiz") &&
      Array.isArray(quiz_content)
    ) {
      await this.quizRepository.upsert(lesson.id, quiz_content);
    }
    if (data.type === "project") {
      await this.projectRepository.upsert(lesson.id, {
        description: project_description,
        specs: project_specs,
      });
    }
    if (data.type === "lab") {
      await this.labRepository.upsert(lesson.id, {
        description: lab_description,
        category: lab_category,
        learnTitle: lab_learn_title,
        durationMinutes: lab_duration_minutes,
        learnBody: lab_learn_body,
        specs: lab_specs,
      });
    }

    const lessonWithContent = await this.lessonRepository.findById(data.id);
    return {
      lesson: lessonWithContent ?? updatedLesson,
      ...(videoWarnings?.length ? { videoWarnings } : {}),
    };
  }
}
