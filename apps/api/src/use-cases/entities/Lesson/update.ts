import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IVideoRepository } from "../../../repositories/video-repository";
import { IArticleRepository } from "../../../repositories/article-repository";
import { IQuizRepository } from "../../../repositories/quiz-repository";
import { IProjectRepository } from "../../../repositories/project-repository";
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
  quiz_content?: unknown[];
  project_description?: string;
  project_specs?: unknown;
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
    private articleRepository: IArticleRepository,
    private quizRepository: IQuizRepository,
    private projectRepository: IProjectRepository
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
      body,
      quiz_content,
      project_description,
      project_specs,
      ...updateData
    } = data;
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

    const lessonWithContent = await this.lessonRepository.findById(data.id);
    return {
      lesson: lessonWithContent ?? updatedLesson,
    };
  }
}
