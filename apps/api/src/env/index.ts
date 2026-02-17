import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_CLIENT: z.enum(["pg"]),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  COOKIE_SECURE: z
    .preprocess(
      (val) => {
        // Se não definido, usar true em produção, false em desenvolvimento
        if (val === undefined || val === null) {
          return process.env.NODE_ENV === "production";
        }
        if (typeof val === "boolean") {
          return val;
        }
        if (typeof val === "string") {
          return val === "true" || val === "1";
        }
        return false;
      },
      z.boolean()
    )
    .default(process.env.NODE_ENV === "production"),
  CAN_ASSOCIATE_PROVIDER: z
    .preprocess(
      (val) => {
        if (val === undefined || val === null) {
          return true; // Por padrão permite associar provider
        }
        if (typeof val === "boolean") {
          return val;
        }
        if (typeof val === "string") {
          return val === "true" || val === "1";
        }
        return true;
      },
      z.boolean()
    )
    .default(true),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid enviroment variables", _env.error.format());

  throw new Error("Invalid enviroment variables");
}

export const env = _env.data;
