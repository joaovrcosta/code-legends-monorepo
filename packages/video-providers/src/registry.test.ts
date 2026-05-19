import { describe, expect, it } from 'vitest'
import { detectHandlerKeyFromUrl, formatEmbedUrl } from './registry'

describe('formatEmbedUrl', () => {
  it('does not treat panda v= as youtube', () => {
    const url =
      'https://player-vz-abc.tv.pandavideo.com.br/embed/?v=11111111-1111-1111-1111-111111111111'
    const embed = formatEmbedUrl(url)
    expect(embed).toContain('pandavideo')
    expect(embed).not.toContain('youtube')
  })

  it('formats youtube watch url', () => {
    const embed = formatEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(embed).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
})

describe('detectHandlerKeyFromUrl', () => {
  it('detects panda before youtube on v= param', () => {
    const key = detectHandlerKeyFromUrl(
      'https://player-vz-x.tv.pandavideo.com.br/embed/?v=uuid',
    )
    expect(key).toBe('panda')
  })
})
