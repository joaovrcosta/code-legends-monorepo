export interface PaidPaymentRow {
  id: string;
  status: string;
  plan: string;
  paidAt: Date | null;
  createdAt: Date;
  metadata: unknown;
}

export interface IPaymentsRepository {
  findLatestPaidByUserId(userId: string): Promise<PaidPaymentRow | null>;
  findPaidByIdAndUserId(
    paymentId: string,
    userId: string
  ): Promise<{ id: string; status: string } | null>;
}
