import type { ICourseMetricsRepository } from "../../../repositories/course-metrics-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface GetCourseMetricsRequest {
  courseId: string;
}

export class GetCourseMetricsUseCase {
  constructor(private courseMetricsRepository: ICourseMetricsRepository) {}

  async execute({ courseId }: GetCourseMetricsRequest) {
    const metrics = await this.courseMetricsRepository.getByCourseId(courseId);

    if (!metrics) {
      throw new CourseNotFoundError();
    }

    return metrics;
  }
}
