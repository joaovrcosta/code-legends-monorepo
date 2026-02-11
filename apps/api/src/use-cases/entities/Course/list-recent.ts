import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";

interface ListRecentCoursesRequest {
  limit?: number;
}

interface ListRecentCoursesResponse {
  courses: Course[];
}

export class ListRecentCoursesUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(
    data?: ListRecentCoursesRequest
  ): Promise<ListRecentCoursesResponse> {
    const courses = await this.courseRepository.findRecent(data?.limit);

    return {
      courses,
    };
  }
}
