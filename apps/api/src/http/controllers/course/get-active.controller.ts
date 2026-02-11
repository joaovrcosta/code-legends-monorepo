import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetActiveCourseUseCase } from "../../../utils/factories/make-get-active-course-use-case";

export async function getActive(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getActiveCourseUseCase = makeGetActiveCourseUseCase();

    const result = await getActiveCourseUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send(result);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
