import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";

/**
 * Opções para verificação de propriedade
 */
interface VerifyOwnershipOptions {
  /**
   * Nome do parâmetro que contém o ID do recurso (ex: "id", "certificateId")
   */
  resourceIdParam?: string;
  /**
   * Tipo de recurso a verificar
   */
  resourceType: "certificate" | "userCourse" | "userProgress";
  /**
   * Se true, permite que admins acessem qualquer recurso
   */
  allowAdmin?: boolean;
}

/**
 * Middleware genérico para verificar propriedade de recursos
 * Previne IDOR (Insecure Direct Object Reference) garantindo que
 * o usuário só possa acessar recursos que pertencem a ele.
 */
export function verifyOwnership(options: VerifyOwnershipOptions) {
  const {
    resourceIdParam = "id",
    resourceType,
    allowAdmin = true,
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.id;
      const userRole = request.user?.role;

      if (!userId) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      // Admins podem acessar qualquer recurso (se permitido)
      if (allowAdmin && userRole === "ADMIN") {
        return; // Permite acesso
      }

      // Obter ID do recurso dos parâmetros
      const params = request.params as Record<string, string>;
      const resourceId = params[resourceIdParam];

      if (!resourceId) {
        return reply.status(400).send({
          message: `Resource ID parameter '${resourceIdParam}' is required`,
        });
      }

      // Verificar propriedade baseado no tipo de recurso
      switch (resourceType) {
        case "certificate": {
          const certificateRepository = new PrismaCertificateRepository();
          const certificate = await certificateRepository.findById(resourceId);

          if (!certificate) {
            return reply.status(404).send({ message: "Certificate not found" });
          }

          if (certificate.userId !== userId) {
            return reply.status(403).send({
              message: "Forbidden - You can only access your own certificates",
            });
          }
          break;
        }

        case "userCourse": {
          // TODO: Implementar verificação para userCourse se necessário
          // Por enquanto, a verificação é feita nos use cases
          break;
        }

        case "userProgress": {
          // TODO: Implementar verificação para userProgress se necessário
          // Por enquanto, a verificação é feita nos use cases
          break;
        }

        default:
          return reply.status(500).send({
            message: `Unsupported resource type: ${resourceType}`,
          });
      }

      // Propriedade verificada, permite acesso
    } catch (error) {
      console.error("Error in verifyOwnership:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}

