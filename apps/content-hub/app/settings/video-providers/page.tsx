'use client'

import { useCallback, useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  listVideoProviders,
  setDefaultVideoProvider,
  setVideoProviderStatus,
  type VideoProviderDto,
} from '@/actions/settings/video-providers'
import { toast } from 'sonner'

export default function VideoProvidersSettingsPage() {
  const [providers, setProviders] = useState<VideoProviderDto[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await listVideoProviders({ includeDeprecated: true })
      setProviders(data.providers)
    } catch {
      toast.error('Erro ao carregar provedores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSetDefault = async (id: string) => {
    if (!confirm('Definir este provedor como padrão global para novas aulas de vídeo?')) {
      return
    }
    try {
      await setDefaultVideoProvider(id)
      toast.success('Provedor padrão atualizado')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao definir padrão')
    }
  }

  const handleDeprecate = async (id: string) => {
    if (!confirm('Deprecar este provedor? Aulas existentes continuam funcionando.')) {
      return
    }
    try {
      await setVideoProviderStatus(id, 'DEPRECATED')
      toast.success('Provedor deprecado')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao deprecar')
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Provedores de vídeo</h1>
          <p className="text-muted mt-1">
            Catálogo global usado nos metadados das aulas. Provedores deprecados não
            aparecem em novas aulas.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted">Carregando...</p>}
            {!loading &&
              providers.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border border-[#25252A] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant="outline">{p.slug}</Badge>
                      {p.isDefault && <Badge>Padrão</Badge>}
                      {p.isBuiltin && <Badge variant="secondary">Built-in</Badge>}
                      {p.status !== 'ACTIVE' && (
                        <Badge variant="destructive">{p.status}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Handler: {p.handlerKey} · Aulas: {p._count?.videos ?? 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!p.isDefault && p.status === 'ACTIVE' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(p.id)}
                      >
                        Definir padrão
                      </Button>
                    )}
                    {p.status === 'ACTIVE' && !p.isBuiltin && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeprecate(p.id)}
                      >
                        Deprecar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
