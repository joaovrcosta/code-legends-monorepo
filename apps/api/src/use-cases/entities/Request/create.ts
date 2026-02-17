import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";

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
  constructor(private requestRepository: IRequestRepository) {}

  async execute(data: CreateRequestRequest): Promise<CreateRequestResponse> {
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
