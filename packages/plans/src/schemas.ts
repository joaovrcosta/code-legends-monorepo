import { z } from 'zod'
import { ALL_PLAN_FEATURES } from './features'

export const planFeatureSchema = z.enum(
  ALL_PLAN_FEATURES as [string, ...string[]],
)

export const planFeaturesArraySchema = z
  .array(planFeatureSchema)
  .refine(
    (features) => new Set(features).size === features.length,
    'Features duplicadas não são permitidas',
  )
