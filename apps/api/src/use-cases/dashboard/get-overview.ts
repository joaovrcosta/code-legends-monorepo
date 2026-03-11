import { DashboardOverviewMetrics, IDashboardRepository } from "../../repositories/dashboard-repository";

interface GetDashboardOverviewResponse {
  metrics: DashboardOverviewMetrics;
}

export class GetDashboardOverviewUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<GetDashboardOverviewResponse> {
    const metrics = await this.dashboardRepository.getOverviewMetrics();

    return {
      metrics,
    };
  }
}
