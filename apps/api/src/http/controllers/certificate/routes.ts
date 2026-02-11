import { FastifyInstance } from "fastify";
import { createCertificate } from "./create.controller";
import { listCertificates } from "./list.controller";
import { getCertificateById } from "./get-by-id.controller";
import { verifyCertificate } from "./verify.controller";
import { deleteCertificate } from "./delete.controller";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyInstructorOrAdmin } from "../../middlewares/verify-instructor-or-admin";
import { verifyOwnership } from "../../middlewares/verify-ownership";

export async function certificateRoutes(app: FastifyInstance) {
  // Todas as rotas de certificados precisam de autenticação
  app.addHook("onRequest", verifyJWT);

  // Listar certificados do usuário autenticado
  app.get("/certificates", listCertificates);

  // Buscar certificado por ID - com verificação de propriedade para prevenir IDOR
  app.get(
    "/certificates/:id",
    {
      onRequest: [verifyOwnership({ resourceType: "certificate", resourceIdParam: "id" })],
    },
    getCertificateById
  );

  // Criar certificado - usuários podem gerar seus próprios certificados quando completarem o curso
  app.post("/certificates", createCertificate);

  // Deletar certificado (apenas instrutores e admins)
  app.delete("/certificates/:id", {
    onRequest: [verifyInstructorOrAdmin],
    handler: deleteCertificate,
  });
}
