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
import { requestRoutes } from "./http/controllers/request/routes";
import { notificationRoutes } from "./http/controllers/notification/routes";
import { verifyCertificate } from "./http/controllers/certificate/verify.controller";
import { env } from "./env/index";

export const app = fastify({
  trustProxy: true,
});

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
  origin: (origin, callback) => {
    const devOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    const prodOrigins = [
      "https://www.codelegends.com.br",
      "https://codelegends.com.br",
    ];

    const allowedOrigins = env.NODE_ENV === "production"
      ? prodOrigins
      : [...devOrigins, ...prodOrigins];

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Em desenvolvimento, permitir qualquer origem localhost
    if (env.NODE_ENV === "development" && origin.includes("localhost")) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
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

// @ts-ignore - skip é uma propriedade válida do fastify-rate-limit
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: 60 * 1000,
  keyGenerator: async (request) => {
    if (request.url?.includes("/notifications/sse")) {
      return `sse:${request.ip}`;
    }

    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    try {
      await request.jwtVerify();
      if (request.user?.id) {
        return `user:${request.user.id}`;
      }
    } catch { }

    return `ip:${request.ip}`;
  },
  skip: (request: any) => {
    if (env.NODE_ENV === "development") return true;
    return (request.url?.includes("/notifications/sse") ?? false) || request.method === "OPTIONS";
  },
  errorResponseBuilder: (request: any, context: any) => {
    return {
      code: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded. Maximum ${context.max} requests per minute allowed.`,
      retryAfter: Math.ceil(context.ttl / 1000),
    };
  },
  addHeaders: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
    "retry-after": true,
  },
});

app.get("/certificates/verify/:id", verifyCertificate);

app.register(usersRoutes);
app.register(courseRoutes);
app.register(categoryRoutes);
app.register(moduleRoutes);
app.register(groupRoutes);
app.register(lessonRoutes);
app.register(favoriteCourseRoutes);
app.register(certificateRoutes);
app.register(tagRoutes);
app.register(requestRoutes);
app.register(notificationRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "validation error", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
    return reply.status(500).send({
      message: "internal server error",
      error: error.message,
      stack: error.stack,
    });
  }

  return reply.status(500).send({ message: "internal server error" });
});