import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateUserUseCase } from "../../../utils/factories/make-create-user-use-case";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    avatar: z.string().optional(),
  });

  const { name, email, password, avatar } = createUserBodySchema.parse(
    request.body
  );

  const createUserUseCase = makeCreateUserUseCase();

  try {
    const user = await createUserUseCase.execute({
      name,
      email,
      password,
      avatar: avatar || null,
    });

    return reply.status(201).send({ user });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
