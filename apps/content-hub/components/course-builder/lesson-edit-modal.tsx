'use client'

import { useState, useEffect, useRef } from 'react'
import {
  LessonWithStructure,
  ModuleWithStructure,
} from '@/actions/course/get-course-with-structure'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VideoProviderFields } from '@/components/lesson/video-provider-fields'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArticleBodyEditor } from './article-body-editor'
import { QuizEditor } from './quiz-editor'
import { Select } from '@/components/ui/select'
import type { Challenge } from '@/actions/lesson/list-lessons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLessonById } from '@/actions/lesson/get-lesson-by-id'
import { updateLesson } from '@/actions/lesson/update-lesson'
import { updateLessonProduction } from '@/actions/lesson/update-lesson-production'
import type {
  LessonProductionPriority,
  LessonProductionStatus,
} from '@/actions/lesson/get-lesson-production-by-course'
import type { UpdateLessonProductionInput } from '@/actions/lesson/update-lesson-production'
import {
  LESSON_PRODUCTION_PRIORITIES,
  LESSON_PRODUCTION_STATUSES,
  lessonProductionStatusLabel,
  normalizeLessonPriority,
  normalizeLessonProductionStatus,
  validateLessonProductionNotesLength,
} from '@/lib/lesson-production-labels'
import {
  getLessonSkillsConfig,
  updateLessonSkillsConfig,
  type LessonSkillConfigItem,
} from '@/actions/skill/get-lesson-skills'
import { listSkills } from '@/actions/skill/list-skills'
import { getAuthTokenFromClient } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { parseSkillWeightInput } from '@/lib/parse-skill-weight'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  getLessonVideoProviderId,
  mapLessonVideoForState,
} from '@/lib/lesson-video'
import {
  findAdjacentVideoLessons,
  lessonNeedsContentLoad,
  mergeLessonDetailIntoLesson,
  type LessonBreadcrumbContext,
  type VideoLessonNeighbor,
} from '@/lib/course-structure'
import { LessonContextBreadcrumb } from './lesson-context-breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SegmentedControl } from '@/components/ui/segmented-control'

function priorityLabel(p: LessonProductionPriority): string {
  switch (p) {
    case 'NONE':
      return 'Sem prioridade'
    case 'LOW':
      return 'Baixa prioridade'
    case 'MEDIUM':
      return 'Média prioridade'
    case 'HIGH':
      return 'Alta prioridade'
    case 'URGENT':
      return 'Urgente'
  }
}

export interface LessonEditViewProps {
  lesson: LessonWithStructure
  courseSkillIds?: string[]
  modules?: ModuleWithStructure[]
  onSave: (updatedLesson: LessonWithStructure) => void
  onCancel: () => void
  onLessonContentLoaded?: (updatedLesson: LessonWithStructure) => void
  variant?: 'modal' | 'page'
  active?: boolean
  breadcrumb?: LessonBreadcrumbContext
}

function mergeLessonPropPreservingContent(
  prev: LessonWithStructure,
  next: LessonWithStructure,
): LessonWithStructure {
  if (prev.id !== next.id) return next

  const nextHasArticleBody = Boolean((next.article?.body ?? '').trim())
  const nextHasQuiz =
    Array.isArray(next.quiz?.content) && next.quiz.content.length > 0
  const nextHasProject = Boolean(next.project)

  return {
    ...next,
    article: nextHasArticleBody ? next.article : (prev.article ?? next.article),
    quiz: nextHasQuiz ? next.quiz : (prev.quiz ?? next.quiz),
    project: nextHasProject ? next.project : (prev.project ?? next.project),
  }
}

function formatVideoNeighborBlock(
  label: string,
  neighbor: VideoLessonNeighbor,
): string {
  const duration =
    neighbor.lesson.video_duration?.trim() ||
    neighbor.lesson.video?.duration?.trim() ||
    'não informada'
  const objective =
    neighbor.lesson.description?.trim() || 'não informado'

  return `${label}:
- Título: ${neighbor.lesson.title}
- Objetivo: ${objective}
- Duração: ${duration}
- Local: ${neighbor.moduleTitle} → ${neighbor.groupTitle}`
}

export function LessonEditView({
  lesson,
  courseSkillIds,
  modules,
  onSave,
  onCancel,
  onLessonContentLoaded,
  variant = 'modal',
  active = true,
  breadcrumb,
}: LessonEditViewProps) {
  const [resolvedLesson, setResolvedLesson] = useState(lesson)
  const [loadingContent, setLoadingContent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [metadadosOpen, setMetadadosOpen] = useState(false)
  const [quizMode, setQuizMode] = useState<'editor' | 'json'>('editor')
  const [quizJson, setQuizJson] = useState('')
  const [lessonTab, setLessonTab] = useState<'desafios' | 'informacoes'>('desafios')
  const [availableSkills, setAvailableSkills] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([])
  const [lessonSkills, setLessonSkills] = useState<LessonSkillConfigItem[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [productionPriority, setProductionPriority] =
    useState<LessonProductionPriority>('NONE')
  const [productionStatus, setProductionStatus] =
    useState<LessonProductionStatus>('TODO')
  const [productionNotes, setProductionNotes] = useState('')

  const normalizeType = (type: string | null | undefined) => {
    const allowed = [
      'video',
      'article',
      'text',
      'quiz',
      'multi_quiz',
      'project',
    ] as const
    const raw = (type ?? '').toString().trim().toLowerCase()
    if (!raw) return 'video'
    if ((allowed as readonly string[]).includes(raw))
      return raw as (typeof allowed)[number]
    const fromEnum: Record<string, (typeof allowed)[number]> = {
      article: 'article',
      video: 'video',
      text: 'text',
      quiz: 'quiz',
      multi_quiz: 'multi_quiz',
      project: 'project',
    }
    return fromEnum[raw] ?? 'video'
  }

  const [formData, setFormData] = useState(() => ({
    title: resolvedLesson.title,
    description: resolvedLesson.description,
    type: normalizeType(resolvedLesson.type),
    slug: resolvedLesson.slug,
    url: resolvedLesson.url || '',
    video_url: resolvedLesson.video_url || resolvedLesson.video?.url || '',
    video_duration:
      resolvedLesson.video_duration || resolvedLesson.video?.duration || '',
    video_provider_id: getLessonVideoProviderId(resolvedLesson.video),
    body: resolvedLesson.article?.body ?? '',
    project_description: resolvedLesson.project?.description ?? '',
    project_specs: JSON.stringify(resolvedLesson.project?.specs ?? {}, null, 2),
    isFree: false,
    locked: resolvedLesson.locked,
    order: resolvedLesson.order,
  }))
  const [quizContent, setQuizContent] = useState<Challenge[]>(
    resolvedLesson.quiz?.content ?? [],
  )

  const lessonRef = useRef(lesson)
  lessonRef.current = lesson

  const onLessonContentLoadedRef = useRef(onLessonContentLoaded)
  onLessonContentLoadedRef.current = onLessonContentLoaded

  const fetchedContentLessonIdRef = useRef<number | null>(null)

  useEffect(() => {
    setResolvedLesson((prev) => mergeLessonPropPreservingContent(prev, lesson))
  }, [lesson])

  useEffect(() => {
    if (!active) return

    const lessonId = lesson.id

    if (fetchedContentLessonIdRef.current === lessonId) {
      return
    }

    if (!lessonNeedsContentLoad(lesson)) {
      fetchedContentLessonIdRef.current = lessonId
      return
    }

    let cancelled = false

    const loadLessonContent = async () => {
      setLoadingContent(true)
      try {
        const token = getAuthTokenFromClient()
        if (!token) return

        const currentLesson = lessonRef.current
        const detail = await getLessonById(lessonId, token)
        if (cancelled || !detail) return

        fetchedContentLessonIdRef.current = lessonId

        const merged = mergeLessonDetailIntoLesson(currentLesson, detail)
        setResolvedLesson(merged)
        onLessonContentLoadedRef.current?.(merged)
      } catch (error) {
        console.error('Erro ao carregar conteúdo da aula:', error)
        toast.error('Erro ao carregar conteúdo da aula')
      } finally {
        if (!cancelled) {
          setLoadingContent(false)
        }
      }
    }

    void loadLessonContent()

    return () => {
      cancelled = true
    }
  }, [active, lesson.id])

  useEffect(() => {
    if (active) {
      setFormData({
        title: resolvedLesson.title,
        description: resolvedLesson.description,
        type: normalizeType(resolvedLesson.type),
        slug: resolvedLesson.slug,
        url: resolvedLesson.url || '',
        video_url: resolvedLesson.video_url || resolvedLesson.video?.url || '',
        video_duration:
          resolvedLesson.video_duration || resolvedLesson.video?.duration || '',
        video_provider_id: getLessonVideoProviderId(resolvedLesson.video),
        body: resolvedLesson.article?.body ?? '',
        project_description: resolvedLesson.project?.description ?? '',
        project_specs: JSON.stringify(resolvedLesson.project?.specs ?? {}, null, 2),
        isFree: resolvedLesson.isFree,
        locked: resolvedLesson.locked,
        order: resolvedLesson.order,
      })
      setQuizContent(resolvedLesson.quiz?.content ?? [])
      setQuizMode('editor')
      setLessonTab('desafios')
      setQuizJson(JSON.stringify(resolvedLesson.quiz?.content ?? [], null, 2))
      setSlugManuallyEdited(false)
      setProductionPriority(
        normalizeLessonPriority(resolvedLesson.production?.priority),
      )
      setProductionStatus(
        normalizeLessonProductionStatus(resolvedLesson.production?.status),
      )
      setProductionNotes(resolvedLesson.production?.notes ?? '')
    }
  }, [resolvedLesson, active])

  useEffect(() => {
    if (!active) return
    // Mantém o JSON em sync quando o usuário edita pelo editor visual.
    setQuizJson(JSON.stringify(quizContent ?? [], null, 2))
  }, [quizContent, active])

  function tryApplyQuizJson(raw: string): boolean {
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        toast.error('JSON inválido: esperado um array de challenges ([])')
        return false
      }
      setQuizContent(parsed as Challenge[])
      toast.success('Challenges atualizados via JSON')
      return true
    } catch (e) {
      toast.error(
        `JSON inválido: ${e instanceof Error ? e.message : 'não foi possível parsear'}`,
      )
      return false
    }
  }

  useEffect(() => {
    const loadLessonSkills = async () => {
      if (!active) return
      const token = getAuthTokenFromClient()
      if (!token) return

      try {
        const [{ skills }, config] = await Promise.all([
          listSkills(),
          getLessonSkillsConfig(resolvedLesson.id, token),
        ])

        setAvailableSkills(
          skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            slug: skill.slug,
          })),
        )
        setLessonSkills(config?.skills ?? [])
        setSelectedSkillId('')
      } catch (error) {
        console.error('Erro ao carregar skills da aula:', error)
      }
    }

    void loadLessonSkills()
  }, [active, resolvedLesson.id])

  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }))
    }
  }, [formData.title, slugManuallyEdited])

  const buildVideoScriptPrompt = () => {
    const title = formData.title?.trim() || resolvedLesson.title || 'Tema da aula'
    const description =
      formData.description?.trim() ||
      resolvedLesson.description?.trim() ||
      'Explique o conceito principal desta aula de forma clara e prática.'
    const duration = '5–10 minutos'

    const contextParts = [
      breadcrumb?.courseTitle ? `Curso: ${breadcrumb.courseTitle}` : null,
      breadcrumb?.moduleTitle ? `Módulo: ${breadcrumb.moduleTitle}` : null,
      breadcrumb?.groupTitle ? `Submódulo: ${breadcrumb.groupTitle}` : null,
    ].filter(Boolean)

    const adjacentVideoLessons = modules
      ? findAdjacentVideoLessons(modules, resolvedLesson.id)
      : null

    const videoNeighborsBlock = adjacentVideoLessons
      ? `
VIDEOAULAS VIZINHAS

${adjacentVideoLessons.previous
        ? formatVideoNeighborBlock('Videoaula anterior', adjacentVideoLessons.previous)
        : 'Videoaula anterior: não há videoaula anterior neste curso.'}

${adjacentVideoLessons.next
        ? formatVideoNeighborBlock('Próxima videoaula', adjacentVideoLessons.next)
        : 'Próxima videoaula: não há próxima videoaula neste curso.'}
`
      : ''

    return `Você é um especialista em ensino de programação e criação de roteiros para videoaulas educacionais, inspirado no estilo de explicação clara, fluida e envolvente (como “The Joy of React”, mas adaptado para vídeo).

Crie um roteiro de videoaula com linguagem natural, didática e fácil de acompanhar ouvindo.

### 💡 DIRETRIZES DE ESTILO E ENGAJAMENTO

- **Analogias Poderosas:** Use metáforas do mundo real para explicar conceitos abstratos de código. A analogia deve enriquecer a explicação técnica de forma sutil, sem desviar do foco principal.
- **Ritmo Confortável:** Escreva exatamente como uma pessoa fala naturalmente. Alterne frases curtas; use "..." dentro de [FALA] para pausas retóricas. Use [PAUSA] só para silêncio real na gravação.
- **Abordagem Visual:** Em vez de apenas listar o código, descreva o que está acontecendo conceitualmente na tela enquanto o código aparece.

---

Tema da aula:
${title}

Objetivo da aula:
${description}

Duração estimada:
${duration}
${contextParts.length ? `
Contexto da aula:
${contextParts.join('\n')}
` : ''}${videoNeighborsBlock}
---

ESTRUTURA DO ROTEIRO

1. Abertura (hook)
   - Comece com uma pergunta, situação ou observação curiosa
   - Deve prender atenção nos primeiros segundos
   - Evite histórias longas

2. Contextualização rápida
   - Explique por que isso importa
   - Mostre onde o conceito aparece na prática

3. Explicação principal (progressiva)
   - Vá do simples ao mais técnico
   - Use linguagem clara e ritmo de fala natural
   - Quebre ideias em blocos curtos (como alguém explicando oralmente)

4. Demonstração / exemplo
   - Use código quando fizer sentido
   - Explique enquanto “mostra”
   - Evite apenas ler código

5. Insight importante
   - Destaque um erro comum ou confusão frequente
   - Mostre o “pulo do gato”

6. Recap rápido
   - Reforce o que foi aprendido

7. Encerramento
   - Conecte com a próxima videoaula quando ela existir
   - Não explique conteúdos que pertencem à próxima videoaula; apenas crie uma transição natural

---

IMPORTANTE

- Considere a sequência do curso ao escrever o roteiro
- Conecte a abertura com a videoaula anterior (se existir)
- Use o submódulo como contexto para manter a aula alinhada com a jornada do aluno
- Ao finalizar, crie uma ponte natural para a próxima videoaula (se existir)
- Ignore quizzes, artigos e projetos entre as videoaulas
- Não invente conteúdo além do informado acima
- Não mencione informações ausentes no contexto

---

REGRAS DAS TAGS (obrigatório)

- [FALA]: TODO texto que será falado em voz alta. Nenhuma frase falada pode ficar fora de [FALA].
- [PAUSA]: APENAS silêncio na gravação. Conteúdo permitido: linha vazia, "..." ou no máximo "(respira)" / "(pausa curta)".
  - PROIBIDO: colocar frases, explicações ou parágrafos depois de [PAUSA].
- [CÓDIGO NA TELA]: somente o que aparece na tela (listas, pseudocódigo, etc.).

Se houver mais fala depois de uma pausa, SEMPRE reabra com [FALA]:

Correto:
[FALA]
Primeira parte...

[PAUSA]

[FALA]
Segunda parte...

Incorreto:
[FALA]
Primeira parte...

[PAUSA]

Segunda parte sem tag...

Outras regras:
- Pausas retóricas no meio da fala → use "..." dentro do mesmo [FALA], não crie [PAUSA].
- Use [PAUSA] no máximo 1 vez a cada 3–5 blocos [FALA], só em transições fortes na gravação.
- Não use "---" ou linhas separadoras; mude de assunto com parágrafo em branco dentro de [FALA] ou com [PAUSA] + novo [FALA].

Antes de entregar, verifique:
1. Toda linha com texto falado está dentro de um bloco [FALA]?
2. Nenhum bloco [PAUSA] tem parágrafos de fala?
3. Depois de cada [PAUSA] vem imediatamente [FALA] ou [CÓDIGO NA TELA] se houver mais conteúdo?

---

FORMATO DO ROTEIRO

- Escreva como fala natural (não como texto formal)
- Use frases curtas e médias (fáceis de falar em voz alta)
- Separe o roteiro em blocos [FALA], [PAUSA] e [CÓDIGO NA TELA]
- Gere apenas o roteiro da videoaula, sem explicar o processo

Exemplo de formatação:

[FALA]
Na aula passada a gente viu o conceito... e hoje vamos praticar.

[PAUSA]

[FALA]
Então agora a gente faz isso de verdade. Você vai criar o seu primeiro algoritmo.

[PAUSA]

[FALA]
Antes de começar, preciso te dizer uma coisa importante...

[CÓDIGO NA TELA]
\`\`\`
1. Receber um número
2. Dividir esse número por 2
\`\`\`

[FALA]
Vamos passar por cada linha juntos...`
  }

  const handleCopyVideoScriptPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildVideoScriptPrompt())
      toast.success('Prompt do roteiro copiado')
    } catch (error) {
      console.error('Erro ao copiar prompt do roteiro:', error)
      toast.error('Não foi possível copiar o prompt do roteiro')
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const token = getAuthTokenFromClient()
      if (!token) {
        toast.error('Token de autenticação não encontrado')
        return
      }

      // UX: se selecionou uma skill no select e esqueceu de clicar em "Adicionar",
      // tentamos incluir automaticamente antes de persistir.
      const pendingSkill =
        selectedSkillId &&
          !lessonSkills.some((ls) => ls.skillId === selectedSkillId) &&
          !(courseSkillIds ?? []).includes(selectedSkillId)
          ? availableSkills.find((s) => s.id === selectedSkillId)
          : null

      const lessonSkillsToPersist = [
        ...lessonSkills,
        ...(pendingSkill
          ? [
            {
              skillId: pendingSkill.id,
              name: pendingSkill.name,
              slug: pendingSkill.slug,
              weight: 100,
            },
          ]
          : []),
      ]

      // Envia apenas o shape que a API espera (evita "Invalid body" por tipos inesperados).
      const basePayload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        slug: formData.slug,
        url: formData.url,
        isFree: formData.isFree,
        locked: formData.locked,
        order: formData.order,
      }

      const payload =
        formData.type === 'quiz' || formData.type === 'multi_quiz'
          ? { ...basePayload, quiz_content: quizContent }
          : formData.type === 'project'
            ? {
              ...basePayload,
              project_description: formData.project_description,
              project_specs: (() => {
                try {
                  return JSON.parse(formData.project_specs || '{}')
                } catch {
                  return {}
                }
              })(),
            }
            : formData.type === 'video'
              ? {
                ...basePayload,
                video_url: formData.video_url,
                video_duration: formData.video_duration,
                video_provider_id: formData.video_provider_id || undefined,
              }
              : formData.type === 'article' || formData.type === 'text'
                ? { ...basePayload, body: String(formData.body ?? '') }
                : basePayload

      const { lesson: savedLesson } = await updateLesson(
        resolvedLesson.id.toString(),
        payload,
        token,
      )
      await updateLessonSkillsConfig(
        resolvedLesson.id,
        lessonSkillsToPersist.map((item) => ({
          skillId: item.skillId,
          weight: item.weight,
        })),
        token,
      )

      const notesLengthError = validateLessonProductionNotesLength(productionNotes)
      if (notesLengthError) {
        toast.error(notesLengthError)
        return
      }

      const prevStatus = normalizeLessonProductionStatus(
        resolvedLesson.production?.status,
      )
      const prevNotes = (resolvedLesson.production?.notes ?? '').trim()
      const nextNotes = productionNotes.trim()
      const prevP = normalizeLessonPriority(resolvedLesson.production?.priority)
      const nextP = normalizeLessonPriority(productionPriority)

      const productionPatch: UpdateLessonProductionInput = {}
      if (prevStatus !== productionStatus) {
        productionPatch.status = productionStatus
      }
      if (prevNotes !== nextNotes) {
        productionPatch.notes = nextNotes || null
      }
      if (prevP !== nextP) {
        productionPatch.priority = nextP
      }

      let nextProduction = resolvedLesson.production ?? null
      if (Object.keys(productionPatch).length > 0) {
        try {
          const { item } = await updateLessonProduction(
            resolvedLesson.id,
            productionPatch,
            token,
          )
          nextProduction = {
            status: item.status,
            priority: item.priority,
            notes: item.notes ?? null,
            updatedAt: item.updatedAt,
            updatedById: item.updatedById,
          }
        } catch (prodErr) {
          console.error(prodErr)
          toast.error(
            'Aula salva, mas não foi possível atualizar a produção editorial.',
          )
          nextProduction = resolvedLesson.production ?? null
        }
      }

      if (pendingSkill) {
        setLessonSkills(lessonSkillsToPersist)
        setSelectedSkillId('')
      }
      const savedVideo = (savedLesson as { video?: Parameters<typeof mapLessonVideoForState>[0] })
        .video
      onSave({
        ...resolvedLesson,
        ...formData,
        url: formData.url || null,
        video_url: formData.video_url || null,
        video_duration: formData.video_duration || null,
        video:
          formData.type === 'video'
            ? mapLessonVideoForState(
              savedVideo ?? {
                url: formData.video_url || null,
                duration: formData.video_duration || null,
                provider: formData.video_provider_id
                  ? { id: formData.video_provider_id }
                  : null,
              },
              formData.video_url,
              formData.video_duration,
            )
            : null,
        article:
          (formData.type === 'article' || formData.type === 'text') &&
            formData.body
            ? { body: formData.body }
            : null,
        quiz:
          formData.type === 'quiz' || formData.type === 'multi_quiz'
            ? { content: quizContent }
            : null,
        project:
          formData.type === 'project'
            ? {
              description: formData.project_description,
              specs: (() => {
                try {
                  return JSON.parse(formData.project_specs || '{}')
                } catch {
                  return {}
                }
              })(),
            }
            : null,
        production: nextProduction,
      })
      toast.success('Aula salva com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar aula:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar aula')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'modal' && !active) return null

  const isPage = variant === 'page'
  const isArticle = formData.type === 'article'
  const isQuizType =
    formData.type === 'quiz' || formData.type === 'multi_quiz'
  const isFullScreen = !isPage && isQuizType
  const useQuizWorkspaceLayout = isQuizType && (isFullScreen || isPage)

  const lessonInformationFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as
                  | 'article'
                  | 'video'
                  | 'text'
                  | 'quiz'
                  | 'multi_quiz'
                  | 'project',
              })
            }
            required
          >
            <option value="video">Vídeo</option>
            <option value="article">Leitura</option>
            <option value="text">Texto</option>
            <option value="quiz">Quiz</option>
            <option value="multi_quiz">Multi quiz</option>
            <option value="project">Projeto</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) =>
            setFormData({ ...formData, url: e.target.value })
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-description">Descrição *</Label>
        <Textarea
          id="lesson-description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Skills desta aula (opcional)</Label>
        <p className="text-sm text-ch-muted">
          Essas skills recebem XP adicional quando o aluno conclui esta aula.
        </p>
        <div className="flex gap-2">
          <Select
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
          >
            <option value="">Selecione uma skill</option>
            {availableSkills
              .filter((skill) => {
                const alreadyInLesson = lessonSkills.some(
                  (ls) => ls.skillId === skill.id,
                )
                const alreadyInCourse = (courseSkillIds ?? []).includes(skill.id)
                return !alreadyInLesson && !alreadyInCourse
              })
              .map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.slug})
                </option>
              ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!selectedSkillId) return
              const skill = availableSkills.find((s) => s.id === selectedSkillId)
              if (!skill) return
              setLessonSkills((prev) => [
                ...prev,
                {
                  skillId: skill.id,
                  name: skill.name,
                  slug: skill.slug,
                  weight: 100,
                },
              ])
              setSelectedSkillId('')
            }}
          >
            Adicionar
          </Button>
        </div>

        {lessonSkills.length > 0 && (
          <div className="mt-3 space-y-2">
            {lessonSkills.map((item) => (
              <div
                key={item.skillId}
                className="flex items-center justify-between rounded-md border border-ch-border px-3 py-2 text-sm border-ch-border"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-ch-muted">
                    slug: {item.slug}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={item.weight}
                    onChange={(e) => {
                      const value = parseSkillWeightInput(e.target.value)
                      setLessonSkills((prev) =>
                        prev.map((ls) =>
                          ls.skillId === item.skillId
                            ? { ...ls, weight: value }
                            : ls,
                        ),
                      )
                    }}
                    className="w-20"
                  />
                  <span className="text-xs text-ch-muted">
                    %
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setLessonSkills((prev) =>
                        prev.filter((ls) => ls.skillId !== item.skillId),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-ch-border p-4 space-y-4 border-ch-border">
        <div>
          <h3 className="text-sm font-medium text-ch">
            Produção editorial
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Status, prioridade no Kanban e anotações internas da equipe.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lesson-production-status">Status</Label>
            <Select
              id="lesson-production-status"
              value={productionStatus}
              onChange={(e) =>
                setProductionStatus(e.target.value as LessonProductionStatus)
              }
            >
              {LESSON_PRODUCTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {lessonProductionStatusLabel(s)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-production-priority">
              Prioridade no Kanban
            </Label>
            <Select
              id="lesson-production-priority"
              value={productionPriority}
              onChange={(e) =>
                setProductionPriority(e.target.value as LessonProductionPriority)
              }
            >
              {LESSON_PRODUCTION_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {priorityLabel(p)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lesson-production-notes">Anotações</Label>
          <Textarea
            id="lesson-production-notes"
            value={productionNotes}
            onChange={(e) => setProductionNotes(e.target.value)}
            rows={4}
            placeholder="Escreva suas anotações sobre esta aula…"
          />
        </div>
      </div>

      <div className="rounded-lg border border-ch-border">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-t-lg px-4 py-3 text-left font-medium hover:bg-muted/50"
          onClick={() => setMetadadosOpen((o) => !o)}
        >
          <span>Metadados</span>
          {metadadosOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
        </button>
        {metadadosOpen && (
          <div className="space-y-4 border-t px-4 pb-4 pt-0">
            <div className="space-y-2 pt-4">
              <Label htmlFor="lesson-slug">Slug *</Label>
              <div className="flex gap-2">
                <Input
                  id="lesson-slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value })
                    setSlugManuallyEdited(true)
                  }}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSlug = generateSlug(formData.title)
                    setFormData({ ...formData, slug: newSlug })
                    setSlugManuallyEdited(true)
                  }}
                >
                  Gerar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-order">Ordem</Label>
              <Input
                id="lesson-order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isFree: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Aula gratuita</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.locked}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locked: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Bloqueada</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const card = (
    <Card
      className={
        isPage
          ? 'w-full'
          : isFullScreen
            ? 'flex h-full max-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none border-0 shadow-none sm:border sm:shadow-sm'
            : isArticle
              ? 'cb-modal-card-lg'
              : 'cb-modal-card'
      }
    >
      <CardHeader className="shrink-0 space-y-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle>
              {isPage ? 'Informações da Aula' : 'Editar Aula'}
            </CardTitle>
            {loadingContent && (
              <p className="mt-2 text-sm text-ch-muted">
                Carregando conteúdo da aula…
              </p>
            )}

            {breadcrumb && (
              <LessonContextBreadcrumb
                context={breadcrumb}
                className="mt-2"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {formData.type === 'video' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyVideoScriptPrompt}
              >
                📋 Copiar roteiro
              </Button>
            )}

            {variant === 'modal' && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent
        className={
          useQuizWorkspaceLayout
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-6 pt-0'
            : isFullScreen
              ? 'flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-6 pt-0'
              : isPage
                ? 'space-y-6'
                : 'cb-modal-body'
        }
      >
        {useQuizWorkspaceLayout ? (
          <Tabs
            value={lessonTab}
            onValueChange={(value) =>
              setLessonTab(value as 'desafios' | 'informacoes')
            }
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="desafios">Desafios</TabsTrigger>
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
              </TabsList>
              {lessonTab === 'desafios' && (
                <SegmentedControl
                  value={quizMode}
                  onChange={setQuizMode}
                  size="sm"
                  options={[
                    { value: 'editor', label: 'Editor' },
                    { value: 'json', label: 'JSON' },
                  ]}
                />
              )}
            </div>

            <TabsContent
              value="desafios"
              className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
            >
              <div className="min-h-0 flex-1">
                <QuizEditor
                  variant="workspace"
                  challenges={quizContent}
                  onChange={setQuizContent}
                  quizMode={quizMode}
                  quizJson={quizJson}
                  onQuizJsonChange={setQuizJson}
                  onApplyJson={() => {
                    const ok = tryApplyQuizJson(quizJson)
                    if (ok) setQuizMode('editor')
                    return ok
                  }}
                  onReloadJsonFromEditor={() =>
                    setQuizJson(JSON.stringify(quizContent ?? [], null, 2))
                  }
                />
              </div>
            </TabsContent>

            <TabsContent
              value="informacoes"
              className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 data-[state=inactive]:hidden"
            >
              {lessonInformationFields}
            </TabsContent>
          </Tabs>
        ) : (
        <div
          className={
            isFullScreen
              ? 'min-h-0 flex-1 space-y-4 overflow-y-auto pr-1'
              : isPage
                ? `space-y-4${isQuizType ? ' min-h-[60vh]' : ''}`
                : 'cb-modal-scroll space-y-4'
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as
                      | 'article'
                      | 'video'
                      | 'text'
                      | 'quiz'
                      | 'multi_quiz'
                      | 'project',
                  })
                }
                required
              >
                <option value="video">Vídeo</option>
                <option value="article">Leitura</option>
                <option value="text">Texto</option>
                <option value="quiz">Quiz</option>
                <option value="multi_quiz">Multi quiz</option>
                <option value="project">Projeto</option>
              </Select>
            </div>
          </div>

          {(formData.type !== 'article' && formData.type !== 'text') && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          )}

          {formData.type === 'video' && (
            <div className="space-y-3">
              <VideoProviderFields
                videoProviderId={formData.video_provider_id}
                videoUrl={formData.video_url}
                videoDuration={formData.video_duration}
                onProviderIdChange={(video_provider_id) =>
                  setFormData({ ...formData, video_provider_id })
                }
                onVideoUrlChange={(video_url) =>
                  setFormData({ ...formData, video_url })
                }
                onVideoDurationChange={(video_duration) =>
                  setFormData({ ...formData, video_duration })
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ch-border p-3 border-ch-border">
                <div>
                  <p className="text-sm font-medium">Roteiro da videoaula</p>
                  <p className="text-xs text-muted-foreground">
                    Copia um prompt preenchido com os dados desta aula para gerar o roteiro.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyVideoScriptPrompt}
                >
                  Copiar roteiro
                </Button>
              </div>
            </div>
          )}

          {(formData.type === 'article' || formData.type === 'text') && (
            <ArticleBodyEditor
              id="body"
              value={formData.body}
              onChange={(body) => setFormData({ ...formData, body })}
              rows={12}
              isArticle={formData.type === 'article'}
              onSaveRequested={handleSave}
            />
          )}

          {(formData.type === 'quiz' || formData.type === 'multi_quiz') && (
            <div className="space-y-2">
              <Label>Desafios do Quiz</Label>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Você pode cadastrar pelo editor visual ou colar um JSON (array de challenges).
                </p>
                <SegmentedControl
                  value={quizMode}
                  onChange={setQuizMode}
                  size="sm"
                  options={[
                    { value: 'editor', label: 'Editor' },
                    { value: 'json', label: 'JSON' },
                  ]}
                />
              </div>

              {quizMode === 'editor' ? (
                <QuizEditor
                  challenges={quizContent}
                  onChange={setQuizContent}
                />
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={quizJson}
                    onChange={(e) => setQuizJson(e.target.value)}
                    rows={14}
                    className="font-mono text-xs"
                    placeholder='[{"type":"block_slots","question":"...","pieces":[{"id":"p0","content":"..."}],"solution":["p0"]}]'
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => {
                        const ok = tryApplyQuizJson(quizJson)
                        if (ok) setQuizMode('editor')
                      }}
                    >
                      Aplicar JSON
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setQuizJson(JSON.stringify(quizContent ?? [], null, 2))
                      }
                    >
                      Recarregar do editor
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.type === 'project' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_description">Descrição do projeto (Boss)</Label>
                <Textarea
                  id="project_description"
                  value={formData.project_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Descreva o desafio do módulo..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_specs">Configuração do playground (JSON)</Label>
                <Textarea
                  id="project_specs"
                  value={formData.project_specs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_specs: e.target.value,
                    })
                  }
                  rows={12}
                  className="font-mono text-sm"
                  placeholder='{"files": {"/App.js": "..."}, "template": "react", "testFile": "..."}'
                />
                <p className="text-xs text-muted-foreground">
                  Objeto com files, template (vanilla|react), testFile (código do teste) ou tests (Record path - conteúdo).
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Descrição *</Label>
            <Textarea
              id="lesson-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={4}
              required
            />
          </div>

          {formData.type !== 'article' && (
            <div className="space-y-2">
              <Label>Skills desta aula (opcional)</Label>
              <p className="text-sm text-ch-muted">
                Essas skills recebem XP adicional quando o aluno conclui esta aula.
              </p>
              <div className="flex gap-2">
                <Select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                >
                  <option value="">Selecione uma skill</option>
                  {availableSkills
                    .filter((skill) => {
                      const alreadyInLesson = lessonSkills.some(
                        (ls) => ls.skillId === skill.id,
                      )
                      const alreadyInCourse = (courseSkillIds ?? []).includes(skill.id)
                      return !alreadyInLesson && !alreadyInCourse
                    })
                    .map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({skill.slug})
                      </option>
                    ))}
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!selectedSkillId) return
                    const skill = availableSkills.find((s) => s.id === selectedSkillId)
                    if (!skill) return
                    setLessonSkills((prev) => [
                      ...prev,
                      {
                        skillId: skill.id,
                        name: skill.name,
                        slug: skill.slug,
                        weight: 100,
                      },
                    ])
                    setSelectedSkillId('')
                  }}
                >
                  Adicionar
                </Button>
              </div>

              {lessonSkills.length > 0 && (
                <div className="mt-3 space-y-2">
                  {lessonSkills.map((item) => (
                    <div
                      key={item.skillId}
                      className="flex items-center justify-between rounded-md border border-ch-border px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-ch-muted">
                          slug: {item.slug}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={item.weight}
                          onChange={(e) => {
                            const value = parseSkillWeightInput(
                              e.target.value,
                            )
                            setLessonSkills((prev) =>
                              prev.map((ls) =>
                                ls.skillId === item.skillId
                                  ? { ...ls, weight: value }
                                  : ls,
                              ),
                            )
                          }}
                          className="w-20"
                        />
                        <span className="text-xs text-ch-muted">
                          %
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setLessonSkills((prev) =>
                              prev.filter((ls) => ls.skillId !== item.skillId),
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-ch-border p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-ch">
                Produção editorial
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Status, prioridade no Kanban e anotações internas da equipe.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-production-status">Status</Label>
                <Select
                  id="lesson-production-status"
                  value={productionStatus}
                  onChange={(e) =>
                    setProductionStatus(
                      e.target.value as LessonProductionStatus,
                    )
                  }
                >
                  {LESSON_PRODUCTION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {lessonProductionStatusLabel(s)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-production-priority">
                  Prioridade no Kanban
                </Label>
                <Select
                  id="lesson-production-priority"
                  value={productionPriority}
                  onChange={(e) =>
                    setProductionPriority(
                      e.target.value as LessonProductionPriority,
                    )
                  }
                >
                  {LESSON_PRODUCTION_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {priorityLabel(p)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-production-notes">Anotações</Label>
              <Textarea
                id="lesson-production-notes"
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                rows={4}
                placeholder="Escreva suas anotações sobre esta aula…"
              />
            </div>
          </div>

          <div className="rounded-lg border border-ch-border">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-t-lg px-4 py-3 text-left font-medium hover:bg-muted/50"
              onClick={() => setMetadadosOpen((o) => !o)}
            >
              <span>Metadados</span>
              {metadadosOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>
            {metadadosOpen && (
              <div className="space-y-4 border-t px-4 pb-4 pt-0">
                <div className="space-y-2 pt-4">
                  <Label htmlFor="lesson-slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="lesson-slug"
                      value={formData.slug}
                      onChange={(e) => {
                        setFormData({ ...formData, slug: e.target.value })
                        setSlugManuallyEdited(true)
                      }}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSlug = generateSlug(formData.title)
                        setFormData({ ...formData, slug: newSlug })
                        setSlugManuallyEdited(true)
                      }}
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-order">Ordem</Label>
                  <Input
                    id="lesson-order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFree: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Aula gratuita</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.locked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locked: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Bloqueada</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        <div className="mt-4 flex shrink-0 flex-col gap-2 border-t border-border bg-card pt-4">
          {(isFullScreen || useQuizWorkspaceLayout) && (
            <p className="text-center text-xs text-muted-foreground">
              As alterações no editor só são gravadas no servidor ao clicar em{' '}
              <strong>Salvar</strong> (ou Ctrl+Enter no modo texto).
            </p>
          )}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading
                ? 'Salvando...'
                : isPage
                  ? 'Salvar Alterações'
                  : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isPage) return card

  return (
    <div
      className={[
        'cb-modal-overlay',
        isFullScreen ? 'items-stretch justify-stretch' : '',
      ].join(' ')}
    >
      {card}
    </div>
  )
}

interface LessonEditModalProps {
  lesson: LessonWithStructure
  courseSkillIds?: string[]
  modules?: ModuleWithStructure[]
  breadcrumb?: LessonBreadcrumbContext
  isOpen: boolean
  onClose: () => void
  onSave: (updatedLesson: LessonWithStructure) => void
  onLessonContentLoaded?: (updatedLesson: LessonWithStructure) => void
}

export function LessonEditModal({
  lesson,
  courseSkillIds,
  modules,
  breadcrumb,
  isOpen,
  onClose,
  onSave,
  onLessonContentLoaded,
}: LessonEditModalProps) {
  return (
    <LessonEditView
      lesson={lesson}
      courseSkillIds={courseSkillIds}
      modules={modules}
      breadcrumb={breadcrumb}
      active={isOpen}
      variant="modal"
      onCancel={onClose}
      onLessonContentLoaded={onLessonContentLoaded}
      onSave={(updated) => {
        onSave(updated)
        onClose()
      }}
    />
  )
}
