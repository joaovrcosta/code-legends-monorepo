import { ILessonRepository } from "../../../repositories/lesson-repository";
import { LessonNotFoundError } from "../../errors/lesson-not-found";

interface DeleteLessonRequest {
  id: number;
}

export class DeleteLessonUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute(data: DeleteLessonRequest): Promise<void> {
    // Verificar se a lição existe
    const lesson = await this.lessonRepository.findById(data.id);

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    await this.lessonRepository.delete(data.id);
  }
}
