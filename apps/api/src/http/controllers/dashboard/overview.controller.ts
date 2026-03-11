import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetDashboardOverviewUseCase } from "../../../utils/factories/make-get-dashboard-overview-use-case";

export async function overview(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getDashboardOverviewUseCase = makeGetDashboardOverviewUseCase();

    const { metrics } = await getDashboardOverviewUseCase.execute();

    return reply.status(200).send({ metrics });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
