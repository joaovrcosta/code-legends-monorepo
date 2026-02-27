export type PlanInfo = {
  icon: string
  title: string
  description: string
  price: string
  installments: string
  features: string[]
  /** Data de expiração da assinatura (ex.: "15/03/2026") */
  expirationDate?: string | null
}

export const INPUT_CLASS =
  'w-full h-12 px-4 rounded-lg bg-[#25252A] border border-[#25252A] text-white placeholder:text-[#7e7e89] focus:border-[#00C8FF]/50 focus:outline-none text-sm'
