import { Request } from "@prisma/client";
import { IRequestRepository } from "../../../repositories/request-repository";
import { RequestNotFoundError } from "../../errors/request-not-found";

interface GetRequestByIdResponse {
  request: Request;
}

export class GetRequestByIdUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(id: string): Promise<GetRequestByIdResponse> {
    const request = await this.requestRepository.findById(id);

    if (!request) {
      throw new RequestNotFoundError();
    }

    return {
      request,
    };
  }
}
