import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface DeleteCourseRequest {
  id: string;
}

export class DeleteCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(data: DeleteCourseRequest): Promise<void> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(data.id);

    if (!course) {
      throw new CourseNotFoundError();
    }

    await this.courseRepository.delete(data.id);
  }
}
