import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IGroupRepository } from "../../../repositories/group-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { IVideoRepository } from "../../../repositories/video-repository";
import { IArticleRepository } from "../../../repositories/article-repository";
import { IQuizRepository } from "../../../repositories/quiz-repository";
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
  body?: string;
  quiz_content?: unknown[];
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
    private articleRepository: IArticleRepository,
    private quizRepository: IQuizRepository
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

    const { video_url, video_duration, body, quiz_content, ...lessonData } = data;
    const lesson = await this.lessonRepository.create(lessonData);

    if (data.type === "video" && (video_url != null || video_duration != null)) {
      await this.videoRepository.create({
        lessonId: lesson.id,
        url: video_url,
        duration: video_duration,
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

    const lessonWithContent = await this.lessonRepository.findById(lesson.id);
    return {
      lesson: lessonWithContent ?? lesson,
    };
  }
}
