import { PrismaCourseMetricsRepository } from "../../repositories/prisma/prisma-course-metrics-repository";
import { GetCourseMetricsUseCase } from "../../use-cases/entities/Course/get-metrics";

export function makeGetCourseMetricsUseCase() {
  const courseMetricsRepository = new PrismaCourseMetricsRepository();
  return new GetCourseMetricsUseCase(courseMetricsRepository);
}
