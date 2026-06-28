import type { ComponentType } from 'react'
import type { ChallengeType } from '@code-legends/challenges'
import { BlockSlotsChallenge } from '@/components/classroom/challenge/BlockSlotsChallenge'
import { ExamMcqChallenge } from '@/components/career/exam-mcq-challenge'
import { ChoiceOrTextChallenge } from '@/components/classroom/challenge/ChoiceOrTextChallenge'
import type { ChallengeBlockProps } from '@/components/classroom/challenge/challenge-block-props'

export const CHALLENGE_COMPONENTS: Partial<
  Record<ChallengeType, ComponentType<ChallengeBlockProps>>
> = {
  block_slots: BlockSlotsChallenge,
  exam_mcq: ExamMcqChallenge,
}

export function resolveChallengeComponent(
  type: ChallengeType,
): ComponentType<ChallengeBlockProps> {
  return CHALLENGE_COMPONENTS[type] ?? ChoiceOrTextChallenge
}
