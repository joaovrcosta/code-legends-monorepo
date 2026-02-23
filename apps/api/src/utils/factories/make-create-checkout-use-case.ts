import { CreateCheckoutUseCase } from "../../use-cases/entities/Payment/create-checkout";

export function makeCreateCheckoutUseCase() {
  return new CreateCheckoutUseCase();
}
