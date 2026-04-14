import { IUsersRepository } from "../../../repositories/users-repository";
import { IPaymentsRepository } from "../../../repositories/payments-repository";
import { PaymentNotFoundError } from "../../errors/payment-not-found";
import { PaymentNotPaidError } from "../../errors/payment-not-paid";

interface AckPostPurchaseWelcomeRequestDTO {
  userId: string;
  paymentId: string;
}

export class AckPostPurchaseWelcomeUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private paymentsRepository: IPaymentsRepository
  ) {}

  async execute({
    userId,
    paymentId,
  }: AckPostPurchaseWelcomeRequestDTO): Promise<void> {
    const payment = await this.paymentsRepository.findPaidByIdAndUserId(
      paymentId,
      userId
    );

    if (!payment) {
      throw new PaymentNotFoundError();
    }

    if (payment.status !== "PAID") {
      throw new PaymentNotPaidError();
    }

    await this.usersRepository.update(userId, {
      postPurchaseWelcomeAckPaymentId: payment.id,
    });
  }
}
