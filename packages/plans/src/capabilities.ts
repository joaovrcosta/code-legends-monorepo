import { ALL_PLAN_FEATURES, type PlanFeature } from './features'

export type CapabilitiesMap = Record<PlanFeature, boolean>

export function buildCapabilitiesMap(
  enabledFeatures: readonly string[],
): CapabilitiesMap {
  const enabled = new Set(enabledFeatures)
  return ALL_PLAN_FEATURES.reduce((acc, feature) => {
    acc[feature] = enabled.has(feature)
    return acc
  }, {} as CapabilitiesMap)
}
