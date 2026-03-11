import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

export async function updateCourseStatus(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string() });
  const bodySchema = z.object({
    status: z.enum(["DRAFT", "REVIEW", "PUBLISHED"]),
  });

  const { id } = paramsSchema.parse(request.params);
  const { status } = bodySchema.parse(request.body);

  const user = request.user as any;
  if (status === "PUBLISHED" && user.role !== "ADMIN") {
    return reply.status(403).send({ message: "Apenas administradores podem publicar cursos." });
  }

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return reply.status(404).send({ message: "Curso não encontrado." });

  const updated = await prisma.course.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? (course.publishedAt ?? new Date()) : course.publishedAt,
      active: status === "PUBLISHED",
    },
    select: { id: true, title: true, status: true, active: true },
  });

  return reply.status(200).send({ course: updated });
}
