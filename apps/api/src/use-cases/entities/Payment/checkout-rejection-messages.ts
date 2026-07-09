import type { UpgradeRejectionReason } from '../../domain/subscription-upgrade'

export const CHECKOUT_REJECTION_MESSAGES: Record<UpgradeRejectionReason, string> =
  {
    invalid_plan: 'Plano inválido',
    already_on_plan: 'Você já está neste plano',
    downgrade_not_allowed:
      'Não é possível fazer downgrade. Aguarde o vencimento da assinatura atual.',
    ambiguous_plan_tier:
      'Configuração de planos ambígua. Entre em contato com o suporte.',
    subscription_ending_soon:
      'Sua assinatura está prestes a expirar. Renove o plano desejado após o vencimento.',
    invalid_upgrade_amount:
      'Não há valor de upgrade a cobrar para este período. Tente após o vencimento.',
  }

export function checkoutRejectionMessage(
  reason: UpgradeRejectionReason | 'api_not_configured' | 'user_not_found',
): string {
  if (reason === 'api_not_configured') {
    return 'Pagamento temporariamente indisponível'
  }
  if (reason === 'user_not_found') {
    return 'Usuário não encontrado'
  }
  return CHECKOUT_REJECTION_MESSAGES[reason]
}
