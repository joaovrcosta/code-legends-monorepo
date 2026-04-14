export class PaymentNotPaidError extends Error {
  constructor() {
    super("Payment is not paid");
  }
}
