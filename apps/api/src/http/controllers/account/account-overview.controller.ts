import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetAccountOverviewUseCase } from "../../../utils/factories/make-get-account-overview-use-case";
import { makeUpdateUserDataUseCase } from "../../../utils/factories/make-update-user-data-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { sanitizeUser } from "../../utils/sanitize";
import { Role } from "@prisma/client";

// GET - Visualizar raio X (apenas ADMIN)
export async function getAccountOverview(request: FastifyRequest, reply: FastifyReply) {
  const getAccountOverviewParamsSchema = z.object({
    userId: z.string(),
  });

  const getAccountOverviewQuerySchema = z.object({
    completedLessonsLimit: z.coerce.number().optional().default(50),
  });

  const { userId } = getAccountOverviewParamsSchema.parse(request.params);
  const { completedLessonsLimit } = getAccountOverviewQuerySchema.parse(request.query);

  // Validar limite máximo (prevenir abusos)
  const limit = Math.min(Math.max(1, completedLessonsLimit), 500); // Entre 1 e 500

  try {
    const getAccountOverviewUseCase = makeGetAccountOverviewUseCase();
    const overview = await getAccountOverviewUseCase.execute({ 
      userId,
      completedLessonsLimit: limit,
    });

    // Sanitizar dados do usuário - admin vê dados completos
    const sanitizedUser = sanitizeUser(overview.user, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isAdmin: true,
    });

    return reply.status(200).send({
      ...overview,
      user: sanitizedUser,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}

// PUT - Atualizar dados do usuário (apenas ADMIN)
export async function updateAccountData(request: FastifyRequest, reply: FastifyReply) {
  const updateAccountParamsSchema = z.object({
    userId: z.string(),
  });

  const updateAccountBodySchema = z.object({
    onboardingCompleted: z.boolean().optional(),
    onboardingGoal: z.string().nullable().optional(),
    onboardingCareer: z.string().nullable().optional(),
    name: z.string().optional(),
    bio: z.string().nullable().optional(),
    expertise: z.array(z.string()).optional(),
    totalXp: z.number().optional(),
    level: z.number().optional(),
    xpToNextLevel: z.number().optional(),
  });

  const { userId } = updateAccountParamsSchema.parse(request.params);
  const bodyData = updateAccountBodySchema.parse(request.body);

  try {
    const updateUserDataUseCase = makeUpdateUserDataUseCase();
    const { user } = await updateUserDataUseCase.execute({
      userId,
      ...bodyData,
    });

    // Sanitizar dados do usuário - admin vê dados completos
    const sanitizedUser = sanitizeUser(user, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isAdmin: true,
    });

    return reply.status(200).send({ user: sanitizedUser });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
