export const PlanFeatures = {
  CATALOG_PAID: 'catalog.paid',
  CAREER_ENROLL: 'career.enroll',
  PATH_UNIT_ACCESS: 'path_unit.access',
  CERTIFICATE: 'certificate.issue',
} as const

export type PlanFeature = (typeof PlanFeatures)[keyof typeof PlanFeatures]

export const ALL_PLAN_FEATURES = Object.values(PlanFeatures) as PlanFeature[]

export const PLAN_FEATURE_LABELS: Record<PlanFeature, string> = {
  [PlanFeatures.CATALOG_PAID]: 'Acesso a conteúdos pagos do catálogo',
  [PlanFeatures.CAREER_ENROLL]: 'Matrícula em carreiras',
  [PlanFeatures.PATH_UNIT_ACCESS]: 'Acesso a unidades de trilha',
  [PlanFeatures.CERTIFICATE]: 'Emissão de certificados',
}

/** Features por slug de plano seed (FREE / PRO / PREMIUM). */
export const SEED_PLAN_FEATURES: Record<string, PlanFeature[]> = {
  FREE: [],
  PRO: [PlanFeatures.CATALOG_PAID],
  PREMIUM: [
    PlanFeatures.CATALOG_PAID,
    PlanFeatures.CAREER_ENROLL,
    PlanFeatures.PATH_UNIT_ACCESS,
  ],
}
