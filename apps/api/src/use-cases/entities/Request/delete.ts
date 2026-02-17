import { IRequestRepository } from "../../../repositories/request-repository";
import { RequestNotFoundError } from "../../errors/request-not-found";

export class DeleteRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(id: string): Promise<void> {
    const request = await this.requestRepository.findById(id);

    if (!request) {
      throw new RequestNotFoundError();
    }

    await this.requestRepository.delete(id);
  }
}
