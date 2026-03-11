export interface DashboardOverviewMetrics {
  totalUsers: number;
  totalActiveSubscriptions: number;
  totalMRR: number; // in cents
  totalCourses: number;
  recentEnrollments: {
    id: string;
    userId: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    enrolledAt: Date;
  }[];
  popularCourses: {
    id: string;
    title: string;
    enrollmentCount: number;
  }[];
}

export interface IDashboardRepository {
  getOverviewMetrics(): Promise<DashboardOverviewMetrics>;
}
