import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IGroupRepository } from "../../../repositories/group-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { IVideoRepository } from "../../../repositories/video-repository";
import { IVideoProviderRepository } from "../../../repositories/video-provider-repository";
import { resolveLessonVideoInput } from "../../../lib/resolve-lesson-video";
import { IArticleRepository } from "../../../repositories/article-repository";
import { IQuizRepository } from "../../../repositories/quiz-repository";
import { IProjectRepository } from "../../../repositories/project-repository";
import { LessonAlreadyExistsError } from "../../errors/lesson-already-exists";
import { GroupNotFoundError } from "../../errors/group-not-found";
import { UserNotFoundError } from "../../errors/user-not-found";

interface CreateLessonRequest {
  title: string;
  description: string;
  type: string;
  slug: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  video_provider_id?: string;
  body?: string;
  quiz_content?: unknown[];
  project_description?: string;
  project_specs?: unknown;
  locked?: boolean;
  submoduleId: number;
  order?: number;
  authorId: string;
}

interface CreateLessonResponse {
  lesson: Lesson;
}

export class CreateLessonUseCase {
  constructor(
    private lessonRepository: ILessonRepository,
    private groupRepository: IGroupRepository,
    private usersRepository: IUsersRepository,
    private videoRepository: IVideoRepository,
    private videoProviderRepository: IVideoProviderRepository,
    private articleRepository: IArticleRepository,
    private quizRepository: IQuizRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(data: CreateLessonRequest): Promise<CreateLessonResponse> {
    const group = await this.groupRepository.findById(data.submoduleId);
    if (!group) {
      throw new GroupNotFoundError();
    }

    const author = await this.usersRepository.findById(data.authorId);
    if (!author) {
      throw new UserNotFoundError();
    }

    const lessonWithSameSlug = await this.lessonRepository.findBySlugAndSubmoduleId(
      data.slug,
      data.submoduleId
    );
    if (lessonWithSameSlug) {
      throw new LessonAlreadyExistsError();
    }

    const {
      video_url,
      video_duration,
      video_provider_id,
      body,
      quiz_content,
      project_description,
      project_specs,
      ...lessonData
    } = data;
    const lesson = await this.lessonRepository.create(lessonData);

    if (data.type === "video" && (video_url != null || video_duration != null || video_provider_id != null)) {
      const resolved = await resolveLessonVideoInput({
        videoUrl: video_url,
        videoProviderId: video_provider_id,
        videoProviderRepository: this.videoProviderRepository,
        requireUrl: false,
      });
      await this.videoRepository.create({
        lessonId: lesson.id,
        url: resolved.url,
        duration: video_duration,
        providerId: resolved.provider.id,
      });
    }
    if (data.type === "article" && body != null && body.trim() !== "") {
      await this.articleRepository.create({
        lessonId: lesson.id,
        body: body.trim(),
      });
    }
    if (
      (data.type === "quiz" || data.type === "multi_quiz") &&
      Array.isArray(data.quiz_content)
    ) {
      await this.quizRepository.upsert(lesson.id, data.quiz_content);
    }
    if (data.type === "project") {
      await this.projectRepository.upsert(lesson.id, {
        description: project_description ?? "",
        specs: project_specs,
      });
    }

    const lessonWithContent = await this.lessonRepository.findById(lesson.id);
    return {
      lesson: lessonWithContent ?? lesson,
    };
  }
}
