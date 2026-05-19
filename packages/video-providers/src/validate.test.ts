import { describe, expect, it } from 'vitest'
import { validateVideoUrl } from './validate'
import type { VideoProviderConfig } from './types'

const pandaConfig: VideoProviderConfig = {
  handlerKey: 'panda',
  allowedDomains: ['pandavideo.com.br', 'tv.pandavideo.com.br'],
}

describe('validateVideoUrl', () => {
  it('accepts valid panda embed url', () => {
    const result = validateVideoUrl(
      'https://player-vz-abc.tv.pandavideo.com.br/embed/?v=11111111-1111-1111-1111-111111111111',
      pandaConfig,
    )
    expect(result.valid).toBe(true)
    expect(result.embedUrl).toContain('embed')
  })

  it('rejects javascript protocol', () => {
    const result = validateVideoUrl('javascript:alert(1)', pandaConfig)
    expect(result.valid).toBe(false)
  })

  it('rejects wrong domain for panda', () => {
    const result = validateVideoUrl(
      'https://www.youtube.com/watch?v=abc',
      pandaConfig,
    )
    expect(result.valid).toBe(false)
  })

  it('requires domains for generic', () => {
    const result = validateVideoUrl('https://player.example.com/v/1', {
      handlerKey: 'generic',
      allowedDomains: [],
    })
    expect(result.valid).toBe(false)
  })

  it('accepts generic with allowed domain', () => {
    const result = validateVideoUrl('https://player.example.com/embed/1', {
      handlerKey: 'generic',
      allowedDomains: ['example.com'],
    })
    expect(result.valid).toBe(true)
  })
})
