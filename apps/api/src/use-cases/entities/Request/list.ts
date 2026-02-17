import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";

interface ListRequestsResponse {
  requests: Request[];
}

export class ListRequestsUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(): Promise<ListRequestsResponse> {
    const requests = await this.requestRepository.findAll();

    return {
      requests,
    };
  }
}
