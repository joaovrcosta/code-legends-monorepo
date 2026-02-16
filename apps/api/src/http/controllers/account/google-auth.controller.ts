import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAuthenticateGoogleUseCase } from "../../../utils/factories/make-authenticate-google-use-case";
import { env } from "../../../env/index";

export async function googleAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const googleAuthBodySchema = z.object({
    email: z.string().email(),
    name: z.string(),
    picture: z.string().optional(),
    googleId: z.string(),
  });

  const { email, name, picture, googleId } = googleAuthBodySchema.parse(
    request.body
  );

  try {
    const authenticateGoogleUseCase = makeAuthenticateGoogleUseCase();

    const { user, isNewUser } = await authenticateGoogleUseCase.execute({
      email,
      name,
      avatar: picture || null,
      googleId,
    });

    const token = await reply.jwtSign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "10m",
        }
      }
    );

    const refreshToken = await reply.jwtSign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d",
        }
      }
    );

    reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return reply.status(200).send({
      token,
      refreshToken,
      isNewUser,
      onboardingCompleted: user.onboardingCompleted ?? false,
      onboardingGoal: user.onboardingGoal ?? null,
      onboardingCareer: user.onboardingCareer ?? null,
    });
  } catch (err) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
