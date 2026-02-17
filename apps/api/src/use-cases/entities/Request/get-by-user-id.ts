import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";

interface GetRequestsByUserIdResponse {
  requests: Request[];
}

export class GetRequestsByUserIdUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(userId: string, status?: string): Promise<GetRequestsByUserIdResponse> {
    let requests: Request[];

    if (status) {
      requests = await this.requestRepository.findByUserIdAndStatus(userId, status);
    } else {
      requests = await this.requestRepository.findByUserId(userId);
    }

    return {
      requests,
    };
  }
}
