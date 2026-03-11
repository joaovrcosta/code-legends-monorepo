import { PrismaDashboardRepository } from "../../repositories/prisma/prisma-dashboard-repository";
import { GetDashboardOverviewUseCase } from "../dashboard/get-overview";

export function makeGetDashboardOverviewUseCase() {
  const dashboardRepository = new PrismaDashboardRepository();
  const getDashboardOverviewUseCase = new GetDashboardOverviewUseCase(dashboardRepository);

  return getDashboardOverviewUseCase;
}
