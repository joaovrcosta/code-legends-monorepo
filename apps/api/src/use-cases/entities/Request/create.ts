import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";
import {
  CAREER_FINAL_EXAM_REQUEST_TYPE,
  evaluateCareerCertificationReadiness,
} from "../Career/career-certification-readiness";
import { CareerFinalExamRequestInvalidError } from "../../errors/career-final-exam-request-invalid";

interface CreateRequestRequest {
  userId: string;
  type: string;
  title?: string | null;
  description?: string | null;
  data?: string | null;
}

interface CreateRequestResponse {
  request: Request;
}

export class CreateRequestUseCase {
  constructor(private requestRepository: IRequestRepository) { }

  async execute(data: CreateRequestRequest): Promise<CreateRequestResponse> {
    if (data.type === CAREER_FINAL_EXAM_REQUEST_TYPE) {
      if (!data.data?.trim()) {
        throw new CareerFinalExamRequestInvalidError(
          "Informe os dados da carreira (campo data com JSON contendo careerId).",
        );
      }
      let careerId: string | undefined;
      try {
        const parsed = JSON.parse(data.data) as { careerId?: string };
        careerId = parsed.careerId;
      } catch {
        throw new CareerFinalExamRequestInvalidError("Campo data deve ser JSON válido.");
      }
      if (!careerId) {
        throw new CareerFinalExamRequestInvalidError("JSON deve conter careerId.");
      }
      const readiness = await evaluateCareerCertificationReadiness(
        data.userId,
        careerId,
      );
      if (!readiness.onlineTrackComplete) {
        throw new CareerFinalExamRequestInvalidError(
          "Conclua 100% dos cursos da carreira e todos os exames com nota mínima antes de agendar o exame final.",
        );
      }
      if (readiness.hasCertificate) {
        throw new CareerFinalExamRequestInvalidError("Certificado já emitido para esta carreira.");
      }
      if (readiness.finalExamClearedAt) {
        throw new CareerFinalExamRequestInvalidError(
          "Exame final já liberado. Emita o certificado em Minha conta.",
        );
      }
      if (readiness.pendingFinalExamRequest) {
        throw new CareerFinalExamRequestInvalidError(
          "Já existe uma solicitação pendente para esta carreira.",
        );
      }
    }

    const request = await this.requestRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title ?? null,
      description: data.description ?? null,
      data: data.data ?? null,
      status: "PENDING",
    });

    return {
      request,
    };
  }
}
