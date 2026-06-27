/**
 * Sons de feedback em desafios (Web Audio API, sem assets).
 * Acerto: chime agudo ascendente. Erro: “tam · tamm” percussivo.
 * Reutiliza um único AudioContext após o primeiro toque.
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

function playTone(
  ctx: AudioContext,
  freqHz: number,
  tStart: number,
  durationSec: number,
  peakGain: number,
): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freqHz, tStart)
  const g = ctx.createGain()
  const attack = 0.012
  g.gain.setValueAtTime(0, tStart)
  g.gain.linearRampToValueAtTime(peakGain, tStart + attack)
  g.gain.exponentialRampToValueAtTime(0.0009, tStart + durationSec)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(tStart)
  osc.stop(tStart + durationSec + 0.025)
}

/** Chime leve ao acertar (C5 → E5). */
export function playCorrectChime(): void {
  const ctx = getCtx()
  if (!ctx) return
  const t0 = ctx.currentTime
  playTone(ctx, 523.25, t0, 0.13, 0.11)
  playTone(ctx, 659.25, t0 + 0.085, 0.15, 0.09)
}

/** Um “tam” / “tamm”: ataque seco + queda de pitch (som de pele / surdo simplificado). */
function playThump(
  ctx: AudioContext,
  tStart: number,
  freqStartHz: number,
  durationSec: number,
  peakGain: number,
): void {
  const fEnd = Math.max(55, freqStartHz * 0.48)
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freqStartHz, tStart)
  osc.frequency.exponentialRampToValueAtTime(fEnd, tStart + durationSec * 0.92)

  const g = ctx.createGain()
  g.gain.setValueAtTime(0, tStart)
  g.gain.linearRampToValueAtTime(peakGain, tStart + 0.004)
  g.gain.exponentialRampToValueAtTime(0.00085, tStart + durationSec)

  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(tStart)
  osc.stop(tStart + durationSec + 0.03)
}

/** “Tam · tamm” ao errar. */
export function playWrongTamTamm(): void {
  const ctx = getCtx()
  if (!ctx) return
  const t0 = ctx.currentTime
  playThump(ctx, t0, 255, 0.058, 0.16)
  playThump(ctx, t0 + 0.132, 168, 0.1, 0.19)
}

/** Som de sucesso ao concluir uma aula (arpejo maior ascendente). */
export function playLessonCompleteSuccess(): void {
  const ctx = getCtx()
  if (!ctx) return
  const t0 = ctx.currentTime
  const notes = [
    { freq: 523.25, delay: 0, duration: 0.12, gain: 0.1 },
    { freq: 659.25, delay: 0.09, duration: 0.13, gain: 0.1 },
    { freq: 783.99, delay: 0.18, duration: 0.15, gain: 0.11 },
    { freq: 1046.5, delay: 0.28, duration: 0.28, gain: 0.13 },
  ] as const

  for (const note of notes) {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(note.freq, t0 + note.delay)
    const g = ctx.createGain()
    const start = t0 + note.delay
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(note.gain, start + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0009, start + note.duration)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + note.duration + 0.03)
  }
}
