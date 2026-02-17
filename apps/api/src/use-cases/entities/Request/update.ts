import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";
import { RequestNotFoundError } from "../../errors/request-not-found";

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

    const updateData: any = {
      status: data.status,
      title: data.title,
      description: data.description,
      data: data.data,
      response: data.response,
      respondedBy: data.respondedBy,
    };

    // Se está mudando o status para algo diferente de PENDING, registrar resposta
    if (data.status && data.status !== "PENDING") {
      updateData.respondedAt = new Date();
    }

    const request = await this.requestRepository.update(id, updateData);

    return {
      request,
    };
  }
}
