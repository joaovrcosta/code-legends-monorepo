import { GetDashboardOverviewUseCase } from "../../use-cases/dashboard/get-overview";
import { PrismaDashboardRepository } from "../../repositories/prisma/prisma-dashboard-repository";

export function makeGetDashboardOverviewUseCase() {
  const dashboardRepository = new PrismaDashboardRepository();
  const getDashboardOverviewUseCase = new GetDashboardOverviewUseCase(dashboardRepository);

  return getDashboardOverviewUseCase;
}
