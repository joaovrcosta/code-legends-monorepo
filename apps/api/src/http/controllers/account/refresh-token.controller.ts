import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRefreshTokenUseCase } from "../../../utils/factories/make-refresh-token-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { env } from "../../../env/index";

export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const refreshTokenBodySchema = z.object({
    refreshToken: z.string().optional(),
  });

  const body = refreshTokenBodySchema.parse(request.body);

  try {
    // Tentar pegar o refresh token do body primeiro, senão do cookie
    let token = body.refreshToken;

    if (token) {
      // Se veio no body, verificar o token manualmente
      const decoded = (await request.server.jwt.verify(token)) as {
        id: string;
        email: string;
        name: string;
        role: string;
      };
      request.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
    } else {
      // Se não veio no body, verificar o cookie
      await request.jwtVerify({ onlyCookie: true });
      token = request.cookies.refreshToken;
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
        refreshToken: newRefreshToken,
      });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }

    // Token inválido ou expirado
    return reply.status(401).send({ message: "Invalid or expired token" });
  }
}
