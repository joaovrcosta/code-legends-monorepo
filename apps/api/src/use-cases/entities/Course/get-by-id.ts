import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface GetCourseByIdRequest {
  id: string;
}

interface GetCourseByIdResponse {
  course: Course;
}

export class GetCourseByIdUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute({
    id,
  }: GetCourseByIdRequest): Promise<GetCourseByIdResponse> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new CourseNotFoundError();
    }

    return {
      course,
    };
  }
}
