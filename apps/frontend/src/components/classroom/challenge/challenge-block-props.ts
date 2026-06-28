import type { Challenge } from '@/types/roadmap'

export interface ChallengeBlockProps {
  challenge: Challenge
  index?: number
  /** Lição atual (com `challengeXpSlotIndex`) para ganhar XP só na primeira vez que acerta o desafio. */
  lessonId?: number
  /** Índice do desafio na lição (0..N-1), alinhado ao quiz ou à ordem dos blocos `challenge` no artigo. */
  challengeXpSlotIndex?: number
  /** Chamado ao submeter a resposta com o resultado (acertou/errou). Usado no fluxo de quiz multiperguntas. */
  onAnswer?: (correct: boolean) => void
  /** Se definido, após submeter mostra botão "Próxima" em vez de "Tentar novamente". */
  onNext?: () => void
  /** Se false (ex.: exame de carreira), não permite nova tentativa após erro. */
  allowRetry?: boolean
  /** Última questão do quiz — botão "Finalizar" em vez de "Próxima". */
  isLastQuestion?: boolean
  wrongMessage?: string
  /** Notifica quando XP do desafio foi aplicado (primeira vez). */
  onXpAwarded?: (info: { slot: number; amount: number }) => void
  /**
   * Se false, não chama a API de XP ao acertar (ex.: multi_quiz — XP por questão só após aprovar ≥70%).
   * @default true
   */
  awardChallengeXpOnCorrect?: boolean
}
