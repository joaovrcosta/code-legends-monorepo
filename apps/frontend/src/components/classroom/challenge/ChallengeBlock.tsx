'use client'

import type { ChallengeBlockProps } from './challenge-block-props'
import { resolveChallengeComponent } from '@/lib/challenge-components'

export type { ChallengeBlockProps } from './challenge-block-props'

export function ChallengeBlock(props: ChallengeBlockProps) {
  const Component = resolveChallengeComponent(props.challenge.type)
  return <Component {...props} />
}
