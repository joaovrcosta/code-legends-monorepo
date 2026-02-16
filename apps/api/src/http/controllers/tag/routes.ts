import { FastifyInstance } from "fastify";
import { list } from "./list.controller";

export async function tagRoutes(app: FastifyInstance) {
  app.get("/tags", list);
}
