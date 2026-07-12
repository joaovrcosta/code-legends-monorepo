import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'
import { buildPaymentSettingsResponse } from './build-payment-settings'
import type { PaymentSettingsResponse } from './payment-settings.types'

export class GetPaymentSettingsUseCase {
  constructor(
    private paymentProviderRepository: IPaymentProviderRepository,
  ) {}

  async execute(): Promise<PaymentSettingsResponse> {
    const provider = await this.paymentProviderRepository.findDefault()
    return buildPaymentSettingsResponse(provider)
  }
}
