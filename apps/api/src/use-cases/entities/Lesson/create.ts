import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IGroupRepository } from "../../../repositories/group-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
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
    private usersRepository: IUsersRepository
  ) {}

  async execute(data: CreateLessonRequest): Promise<CreateLessonResponse> {
    // Verificar se o grupo (submodule) existe
    const group = await this.groupRepository.findById(data.submoduleId);

    if (!group) {
      throw new GroupNotFoundError();
    }

    // Verificar se o autor existe
    const author = await this.usersRepository.findById(data.authorId);

    if (!author) {
      throw new UserNotFoundError();
    }

    // Verificar se a lição já existe
    const lessonWithSameSlug = await this.lessonRepository.findBySlug(
      data.slug
    );

    if (lessonWithSameSlug) {
      throw new LessonAlreadyExistsError();
    }

    const lesson = await this.lessonRepository.create(data);

    return {
      lesson,
    };
  }
}
