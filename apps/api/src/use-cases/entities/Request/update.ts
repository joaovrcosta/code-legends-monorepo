import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";
import { RequestNotFoundError } from "../../errors/request-not-found";
import { NotificationBuilder } from "../../../utils/notification-builder";
import { createNotification } from "../../../utils/create-notification";
import { prisma } from "../../../lib/prisma";
import { CAREER_FINAL_EXAM_REQUEST_TYPE } from "../Career/career-certification-readiness";
import { makeCreateCareerCertificateUseCase } from "../../../utils/factories/make-create-career-certificate-use-case";

interface UpdateRequestRequest {
  status?: string;
  title?: string | null;
  description?: string | null;
  data?: string | null;
  response?: string | null;
  respondedBy?: string | null;
}

interface UpdateRequestResponse {
  request: Request;
}

export class UpdateRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(
    id: string,
    data: UpdateRequestRequest
  ): Promise<UpdateRequestResponse> {
    const requestExists = await this.requestRepository.findById(id);

    if (!requestExists) {
      throw new RequestNotFoundError();
    }

    const newResponseTrimmed = (data.response ?? "").trim();
    const oldResponseTrimmed = (requestExists.response ?? "").trim();
    const responseUpdatedWithText =
      newResponseTrimmed.length > 0 &&
      newResponseTrimmed !== oldResponseTrimmed;

    const updateData: any = {
      status: data.status,
      title: data.title,
      description: data.description,
      data: data.data,
      response: data.response,
      respondedBy: data.respondedBy,
    };

    if (data.status && data.status !== "PENDING") {
      updateData.respondedAt = new Date();
    } else if (data.response !== undefined && responseUpdatedWithText) {
      updateData.respondedAt = new Date();
    }

    const request = await this.requestRepository.update(id, updateData);

    if (
      data.status === "APPROVED" &&
      requestExists.status !== "APPROVED" &&
      requestExists.type === CAREER_FINAL_EXAM_REQUEST_TYPE &&
      requestExists.data
    ) {
      try {
        const parsed = JSON.parse(requestExists.data) as {
          careerId?: string;
          careerSlug?: string;
        };
        let careerId = parsed.careerId;
        if (!careerId && parsed.careerSlug) {
          const c = await prisma.career.findUnique({
            where: { slug: parsed.careerSlug },
            select: { id: true },
          });
          careerId = c?.id;
        }
        if (careerId) {
          const uc = await prisma.userCareer.findUnique({
            where: {
              userId_careerId: { userId: requestExists.userId, careerId },
            },
            select: { id: true },
          });
          if (uc) {
            await prisma.userCareer.update({
              where: { id: uc.id },
              data: { finalExamClearedAt: new Date() } as { finalExamClearedAt: Date },
            });
            try {
              const createCert = makeCreateCareerCertificateUseCase();
              await createCert.execute({
                userId: requestExists.userId,
                careerId,
              });
            } catch (certErr) {
              console.error(
                "[UpdateRequest] Certificado de carreira não emitido após aprovação:",
                certErr,
              );
            }
          }
        }
      } catch (e) {
        console.error("[UpdateRequest] CAREER_FINAL_EXAM approve hook:", e);
      }
    }

    const statusChanged =
      data.status != null && data.status !== requestExists.status;

    if (statusChanged) {
      try {
        const notificationData = NotificationBuilder.createRequestStatusNotification(
          requestExists.userId,
          {
            requestId: request.id,
            oldStatus: requestExists.status,
            newStatus: data.status as string,
            response: data.response ?? null,
          }
        );

        await createNotification(notificationData);
      } catch (error) {
        console.error("Erro ao criar notificação de status de solicitação:", error);
      }
    } else if (responseUpdatedWithText) {
      try {
        const notificationData = NotificationBuilder.createRequestReplyNotification(
          requestExists.userId,
          {
            requestId: request.id,
            title: requestExists.title,
            response: newResponseTrimmed,
          }
        );

        await createNotification(notificationData);
      } catch (error) {
        console.error("Erro ao criar notificação de resposta na solicitação:", error);
      }
    }

    return {
      request,
    };
  }
}
