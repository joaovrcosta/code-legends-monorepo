import { getHandler } from './registry'
import {
  hostnameMatchesAllowedDomain,
  parseSafeHttpUrl,
} from './url-security'
import type { VideoProviderConfig, VideoUrlValidationResult } from './types'

const DEFAULT_MAX_LENGTH = 2048

export function validateVideoUrl(
  rawUrl: string | null | undefined,
  config: VideoProviderConfig,
): VideoUrlValidationResult {
  const errors: string[] = []

  if (!rawUrl?.trim()) {
    return { valid: false, errors: ['URL do vídeo é obrigatória.'] }
  }

  const maxLen = config.maxUrlLength ?? DEFAULT_MAX_LENGTH
  if (rawUrl.length > maxLen) {
    return { valid: false, errors: [`URL excede ${maxLen} caracteres.`] }
  }

  const allowedProtocols = config.allowedProtocols ?? ['https']
  const parsed = parseSafeHttpUrl(rawUrl, allowedProtocols)
  if (!parsed) {
    return {
      valid: false,
      errors: ['URL inválida ou protocolo não permitido (use HTTPS).'],
    }
  }

  const normalizedUrl = parsed.toString()
  const handler = getHandler(config.handlerKey)
  const embedUrl = handler.formatEmbedUrl(normalizedUrl)

  if (config.handlerKey === 'direct') {
    if (!handler.detectFromUrl(normalizedUrl)) {
      errors.push('URL deve ser um arquivo de vídeo (.mp4, .webm, .m3u8, etc.).')
    }
  } else if (!embedUrl) {
    errors.push('URL não é válida para o provedor selecionado.')
  }

  const domains = config.allowedDomains ?? []
  if (config.handlerKey === 'generic' && domains.length === 0) {
    errors.push('Provedor customizado exige domínios permitidos cadastrados.')
  }

  if (
    domains.length > 0 &&
    !domains.includes('*') &&
    !hostnameMatchesAllowedDomain(parsed.hostname, domains)
  ) {
    errors.push(
      `Domínio "${parsed.hostname}" não está na lista permitida do provedor.`,
    )
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    normalizedUrl,
    embedUrl: embedUrl ?? normalizedUrl,
    errors: [],
  }
}
