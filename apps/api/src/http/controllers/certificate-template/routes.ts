import { FastifyInstance } from "fastify";
import { createTemplate } from "./create.controller";
import { updateTemplate } from "./update.controller";
import { listTemplates } from "./list.controller";
import { deleteTemplate } from "./delete.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";

export async function certificateTemplateRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyAdmin);

  app.post("/certificate-templates", createTemplate);
  app.put("/certificate-templates/:id", updateTemplate);
  app.get("/certificate-templates", listTemplates);
  app.delete("/certificate-templates/:id", deleteTemplate);
}
