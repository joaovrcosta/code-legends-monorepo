import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";

interface ListPopularCoursesRequest {
  limit?: number;
}

interface ListPopularCoursesResponse {
  courses: Course[];
}

export class ListPopularCoursesUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(
    data?: ListPopularCoursesRequest
  ): Promise<ListPopularCoursesResponse> {
    const courses = await this.courseRepository.findPopular(data?.limit);

    return {
      courses,
    };
  }
}
