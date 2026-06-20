export interface CourseMetricsSummary {
  enrollments: number;
  completions: number;
  completionRate: number;
  averageProgress: number;
  favorites: number;
  certificates: number;
  courseLikes: number;
  courseDislikes: number;
  totalLessons: number;
  lessonsCompleted: number;
}

export interface CourseLessonReactionMetrics {
  lessonId: number;
  title: string;
  moduleTitle: string;
  groupTitle: string;
  likes: number;
  dislikes: number;
  ratingCount: number;
  averageRating: number | null;
}

export interface CourseMetricsData {
  summary: CourseMetricsSummary;
  lessonReactions: CourseLessonReactionMetrics[];
}

export interface ICourseMetricsRepository {
  getByCourseId(courseId: string): Promise<CourseMetricsData | null>;
}
