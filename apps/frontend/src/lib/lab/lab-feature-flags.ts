/**
 * Feature flags de performance do lab (etapas 2 e 3 do plano).
 * Off = comportamento legado (rollback rápido).
 *
 * NEXT_PUBLIC_LAB_SANDPACK_RUNTIME_GATE=true  → autoReload sob demanda
 * NEXT_PUBLIC_LAB_RESPECT_TEMPLATE=true       → não forçar react quando há testes
 *
 * Protocolo de métricas (mesma base de código; só a flag muda):
 * - Etapa 2: labSandpackRuntimeGate false vs true → postMessage idle 5s,
 *   digitando com Result fechado, tempo até interativo.
 * - Etapa 3: labRespectTemplate false vs true → só após batch audit de
 *   labs vanilla+testes (`pnpm --filter content-hub audit:vanilla-labs`).
 * Não comparar baseline pré-code-split com pós-runtime-gate.
 */
export function isLabSandpackRuntimeGateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LAB_SANDPACK_RUNTIME_GATE === 'true'
}

export function isLabRespectTemplateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LAB_RESPECT_TEMPLATE === 'true'
}
