import fastify from "fastify";
import { ZodError } from "zod";

import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";

import { usersRoutes } from "./http/controllers/account/routes";
import { courseRoutes } from "./http/controllers/course/routes";
import { categoryRoutes } from "./http/controllers/category/routes";
import { moduleRoutes } from "./http/controllers/module/routes";
import { groupRoutes } from "./http/controllers/group/routes";
import { lessonRoutes } from "./http/controllers/lesson/routes";
import { favoriteCourseRoutes } from "./http/controllers/favorite-course/routes";
import { certificateRoutes } from "./http/controllers/certificate/routes";
import { tagRoutes } from "./http/controllers/tag/routes";
import { verifyCertificate } from "./http/controllers/certificate/verify.controller";
import { env } from "./env/index";

export const app = fastify();

// Configurar parser de JSON para aceitar body vazio
app.removeContentTypeParser("application/json");
app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (req, body, done) => {
    try {
      const json =
        body === "" || body == null ? {} : JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

app.register(fastifyCookie);

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "10m",
  },
});

// Rota pública para verificação de certificados (para recrutadores)
// Deve ser registrada ANTES do plugin de certificados para não passar pelo hook de autenticação
// Rate limiting aplicado para prevenir ataques de enumeração e brute force
app.register(async function (fastify) {
  await fastify.register(fastifyRateLimit, {
    max: 50, // Limite: 50 requisições por minuto por IP
    timeWindow: 60 * 1000, // 1 minuto em milissegundos (para versão 9.x)
  });

  fastify.get("/certificates/verify/:id", verifyCertificate);
});

app.register(usersRoutes);
app.register(courseRoutes);
app.register(categoryRoutes);
app.register(moduleRoutes);
app.register(groupRoutes);
app.register(lessonRoutes);
app.register(favoriteCourseRoutes);
app.register(certificateRoutes);
app.register(tagRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "validation error", issues: error.format() });
  }

  // Sempre logar erros para debug
  console.error("Unhandled error:", error);
  
  if (env.NODE_ENV !== "production") {
    return reply.status(500).send({ 
      message: "internal server error",
      error: error.message,
      stack: error.stack 
    });
  }

  return reply.status(500).send({ message: "internal server error" });
});
