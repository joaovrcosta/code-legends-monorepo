'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  validateVideoUrl,
  detectHandlerKeyFromUrl,
  formatEmbedUrl,
  type VideoProviderHandlerKey,
} from '@code-legends/video-providers'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  createVideoProvider,
  listActiveVideoProviders,
  type VideoProviderDto,
} from '@/actions/settings/video-providers'
import { toast } from 'sonner'
import { VideoDurationInput } from '@/components/ui/video-duration-input'

type Props = {
  videoProviderId: string
  videoUrl: string
  videoDuration: string
  legacyProvider?: VideoProviderDto | null
  /** Só em formulários de criação — evita sobrescrever o provedor salvo na edição. */
  autoSelectDefaultWhenEmpty?: boolean
  onProviderIdChange: (id: string) => void
  onVideoUrlChange: (url: string) => void
  onVideoDurationChange: (duration: string) => void
}

export function VideoProviderFields({
  videoProviderId,
  videoUrl,
  videoDuration,
  legacyProvider,
  autoSelectDefaultWhenEmpty = false,
  onProviderIdChange,
  onVideoUrlChange,
  onVideoDurationChange,
}: Props) {
  const [providers, setProviders] = useState<VideoProviderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [urlErrors, setUrlErrors] = useState<string[]>([])
  const [showNewProvider, setShowNewProvider] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomains, setNewDomains] = useState('')
  const [creating, setCreating] = useState(false)

  const onProviderIdChangeRef = useRef(onProviderIdChange)
  onProviderIdChangeRef.current = onProviderIdChange

  const videoProviderIdRef = useRef(videoProviderId)
  videoProviderIdRef.current = videoProviderId

  const autoSelectDefaultRef = useRef(autoSelectDefaultWhenEmpty)
  autoSelectDefaultRef.current = autoSelectDefaultWhenEmpty

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await listActiveVideoProviders()
      setProviders(data.providers)
      if (autoSelectDefaultRef.current && !videoProviderIdRef.current) {
        const def = data.providers.find((p) => p.isDefault)
        if (def) onProviderIdChangeRef.current(def.id)
      }
      return data.providers
    } catch {
      toast.error('Erro ao carregar provedores de vídeo')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  const selected = useMemo(() => {
    return (
      providers.find((p) => p.id === videoProviderId) ??
      (legacyProvider?.id === videoProviderId ? legacyProvider : null)
    )
  }, [providers, videoProviderId, legacyProvider])

  const validateUrl = useCallback(
    (url: string, provider: VideoProviderDto | null) => {
      if (!url.trim()) {
        setUrlErrors([])
        return
      }
      if (!provider) return
      const domains = Array.isArray(provider.allowedDomains)
        ? provider.allowedDomains
        : []
      const result = validateVideoUrl(url, {
        handlerKey: provider.handlerKey as VideoProviderHandlerKey,
        allowedDomains: domains,
      })
      setUrlErrors(result.valid ? [] : result.errors)
    },
    [],
  )

  useEffect(() => {
    validateUrl(videoUrl, selected ?? null)
  }, [videoUrl, selected, validateUrl])

  const handleUrlChange = (value: string) => {
    onVideoUrlChange(value)
    const detected = detectHandlerKeyFromUrl(value)
    if (detected) {
      const match = providers.find((p) => p.handlerKey === detected)
      if (match && match.id !== videoProviderId) {
        onProviderIdChange(match.id)
        validateUrl(value, match)
        return
      }
    }
    validateUrl(value, selected ?? null)
  }

  const previewEmbed = useMemo(() => {
    if (!videoUrl.trim() || !selected || urlErrors.length > 0) return null
    return formatEmbedUrl(
      videoUrl,
      selected.handlerKey as VideoProviderHandlerKey,
    )
  }, [videoUrl, selected, urlErrors])

  const handleCreateProvider = async () => {
    const domains = newDomains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
    if (!newName.trim() || domains.length === 0) {
      toast.error('Nome e domínios são obrigatórios')
      return
    }
    try {
      setCreating(true)
      const { provider } = await createVideoProvider({
        name: newName.trim(),
        allowedDomains: domains,
      })
      toast.success('Provedor criado')
      setShowNewProvider(false)
      setNewName('')
      setNewDomains('')
      await loadProviders()
      onProviderIdChange(provider.id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar provedor')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <div className="flex items-end justify-between gap-2">
          <Label>Provedor de vídeo</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewProvider((v) => !v)}
          >
            {showNewProvider ? 'Cancelar' : '+ Novo provedor'}
          </Button>
        </div>
        <Select
          value={videoProviderId || ''}
          onChange={(e) => onProviderIdChange(e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>
            Selecione o provedor
          </option>
          {legacyProvider &&
            legacyProvider.status !== 'ACTIVE' &&
            !providers.some((p) => p.id === legacyProvider.id) && (
              <option value={legacyProvider.id}>
                {legacyProvider.name} (legado)
              </option>
            )}
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.isDefault ? ' · padrão' : ''}
            </option>
          ))}
        </Select>
        {selected?.helpText && (
          <p className="text-xs text-muted-foreground">{selected.helpText}</p>
        )}
      </div>

      {showNewProvider && (
        <div className="sm:col-span-2 rounded-lg border border-[#25252A] p-4 space-y-3">
          <p className="text-sm font-medium">Cadastrar provedor customizado</p>
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Wistia"
            />
          </div>
          <div className="space-y-1">
            <Label>Domínios permitidos (vírgula)</Label>
            <Input
              value={newDomains}
              onChange={(e) => setNewDomains(e.target.value)}
              placeholder="player.exemplo.com"
            />
          </div>
          <Button type="button" onClick={handleCreateProvider} disabled={creating}>
            {creating ? 'Salvando...' : 'Criar provedor'}
          </Button>
        </div>
      )}

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="video_url">URL do vídeo</Label>
        <Input
          id="video_url"
          value={videoUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={selected?.urlPlaceholder ?? 'https://...'}
        />
        {urlErrors.length > 0 && (
          <ul className="text-xs text-red-500 list-disc pl-4">
            {urlErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        {previewEmbed && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
            Preview embed: {previewEmbed}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_duration">Duração do vídeo</Label>
        <VideoDurationInput
          id="video_duration"
          value={videoDuration}
          onChange={onVideoDurationChange}
        />
      </div>
    </div>
  )
}
