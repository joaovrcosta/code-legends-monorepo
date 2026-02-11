import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface GetCourseBySlugRequest {
  slug: string;
}

interface GetCourseBySlugResponse {
  course: Course;
}

export class GetCourseBySlugUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute({
    slug,
  }: GetCourseBySlugRequest): Promise<GetCourseBySlugResponse> {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course) {
      throw new CourseNotFoundError();
    }

    return {
      course,
    };
  }
}
