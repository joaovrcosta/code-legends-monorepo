import { FastifyInstance } from "fastify";
import { addFavorite } from "./add.controller";
import { removeFavorite } from "./remove.controller";
import { listFavorites } from "./list.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";

export async function favoriteCourseRoutes(app: FastifyInstance) {
  // Todas as rotas de favoritos precisam de autenticação
  app.addHook("onRequest", verifyJWT);

  // Listar cursos favoritos do usuário autenticado
  app.get("/favorites", listFavorites);

  // Adicionar curso aos favoritos
  app.post("/favorites/:courseId", addFavorite);

  // Remover curso dos favoritos
  app.delete("/favorites/:courseId", removeFavorite);
}

