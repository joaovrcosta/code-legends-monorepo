import { FastifyReply, FastifyRequest } from "fastify";
import { makeUnlinkGoogleUseCase } from "../../../utils/factories/make-unlink-google-use-case";

export async function unlinkGoogle(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const userId = request.user.id;

        const unlinkGoogleUseCase = makeUnlinkGoogleUseCase();

        const result = await unlinkGoogleUseCase.execute({ userId });

        return reply.status(200).send(result);
    } catch (error: any) {
        if (error.message?.includes("senha")) {
            return reply.status(400).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Internal server error" });
    }
}
