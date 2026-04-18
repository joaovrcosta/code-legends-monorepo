/**
 * Som estilo “tesoura” (dois cortes curtos em ruído filtrado) ao interagir com blocos.
 * Web Audio API, sem assets; reutiliza um único AudioContext após o primeiro toque.
 */
let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new Ctor()
    }
    if (sharedCtx.state === 'suspended') {
      void sharedCtx.resume()
    }
    return sharedCtx
  } catch {
    return null
  }
}

/** Um “corte”: ruído branco curto + bandpass (som metálico / lâmina). */
function playSnip(
  ctx: AudioContext,
  tStart: number,
  midHz: number,
  peakGain: number,
): void {
  const dur = 0.034
  const len = Math.max(1, Math.ceil(ctx.sampleRate * dur))
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    const t = i / len
    const env = Math.exp(-5 * t) * (1 - t * 0.35)
    data[i] = (Math.random() * 2 - 1) * env
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(midHz, tStart)
  bp.Q.value = 3.2
  const g = ctx.createGain()
  g.gain.setValueAtTime(peakGain, tStart)
  g.gain.exponentialRampToValueAtTime(0.00085, tStart + dur)
  src.connect(bp)
  bp.connect(g)
  g.connect(ctx.destination)
  src.start(tStart)
  src.stop(tStart + dur + 0.008)
}

export function playPieceClickSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  const t0 = ctx.currentTime
  // Dois cortes rápidos, levemente diferentes (como fechar a tesoura)
  playSnip(ctx, t0, 3150, 0.11)
  playSnip(ctx, t0 + 0.028, 2450, 0.085)
}
