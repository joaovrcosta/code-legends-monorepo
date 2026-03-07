import { FastifyReply, FastifyRequest } from "fastify";
import { makeRefreshTokenUseCase } from "../../../utils/factories/make-refresh-token-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { env } from "../../../env/index";

export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify({ onlyCookie: true });

    const refreshTokenUseCase = makeRefreshTokenUseCase();

    const { user } = await refreshTokenUseCase.execute({
      userId: request.user.id,
    });

    // Gerar novo access token
    const newToken = await reply.jwtSign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      {
        expiresIn: "10m",
      }
    );

    // Gerar novo refresh token
    const newRefreshToken = await reply.jwtSign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      {
        expiresIn: "7d",
      }
    );

    return reply
      .setCookie("refreshToken", newRefreshToken, {
        path: "/",
        secure: env.COOKIE_SECURE,
        sameSite: "strict",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      })
      .status(200)
      .send({
        token: newToken,
      });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }

    // Token inválido ou expirado
    return reply.status(401).send({ message: "Invalid or expired token" });
  }
}
