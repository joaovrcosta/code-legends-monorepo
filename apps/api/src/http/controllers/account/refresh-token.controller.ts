import { FastifyReply, FastifyRequest } from "fastify";
import { makeRefreshTokenUseCase } from "../../../utils/factories/make-refresh-token-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { env } from "../../../env/index";

export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Aceitar apenas do cookie (mais seguro - não pode ser acessado via JavaScript)
    await request.jwtVerify({ onlyCookie: true });
    const token = request.cookies.refreshToken;

    if (!token) {
      return reply.status(401).send({ message: "Refresh token not found" });
    }

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
        // refreshToken removido do body - está apenas no cookie httpOnly
      });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }

    // Token inválido ou expirado
    return reply.status(401).send({ message: "Invalid or expired token" });
  }
}
