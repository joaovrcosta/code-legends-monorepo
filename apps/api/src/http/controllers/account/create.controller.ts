import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateUserUseCase } from "../../../utils/factories/make-create-user-use-case";
import { toUserPrivateDTO } from "../../dtos/user.dto";

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

    const userDTO = toUserPrivateDTO(user);

    return reply.status(201).send({ user: userDTO });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
