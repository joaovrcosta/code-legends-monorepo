'use client'

import { useState, useEffect } from 'react'
import { LessonWithStructure } from '@/actions/course/get-course-with-structure'
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
import { updateLesson } from '@/actions/lesson/update-lesson'
import { updateLessonProduction } from '@/actions/lesson/update-lesson-production'
import type { LessonProductionPriority } from '@/actions/lesson/get-lesson-production-by-course'
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

const PRIORITIES: LessonProductionPriority[] = [
  'NONE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]

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

function normalizeLessonPriority(
  raw: string | null | undefined,
): LessonProductionPriority {
  const p = raw as LessonProductionPriority | undefined
  return p && PRIORITIES.includes(p) ? p : 'NONE'
}

interface LessonEditModalProps {
  lesson: LessonWithStructure
  courseSkillIds?: string[]
  isOpen: boolean
  onClose: () => void
  onSave: (updatedLesson: LessonWithStructure) => void
}

export function LessonEditModal({
  lesson,
  courseSkillIds,
  isOpen,
  onClose,
  onSave,
}: LessonEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [metadadosOpen, setMetadadosOpen] = useState(false)
  const [quizMode, setQuizMode] = useState<'editor' | 'json'>('editor')
  const [quizJson, setQuizJson] = useState('')
  const [availableSkills, setAvailableSkills] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([])
  const [lessonSkills, setLessonSkills] = useState<LessonSkillConfigItem[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [productionPriority, setProductionPriority] =
    useState<LessonProductionPriority>('NONE')

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
    title: lesson.title,
    description: lesson.description,
    type: normalizeType(lesson.type),
    slug: lesson.slug,
    url: lesson.url || '',
    video_url: lesson.video_url || lesson.video?.url || '',
    video_duration: lesson.video_duration || lesson.video?.duration || '',
    video_provider_id: getLessonVideoProviderId(lesson.video),
    body: lesson.article?.body ?? '',
    project_description: lesson.project?.description ?? '',
    project_specs: JSON.stringify(lesson.project?.specs ?? {}, null, 2),
    isFree: false,
    locked: lesson.locked,
    order: lesson.order,
  }))
  const [quizContent, setQuizContent] = useState<Challenge[]>(
    lesson.quiz?.content ?? [],
  )

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
        type: normalizeType(lesson.type),
        slug: lesson.slug,
        url: lesson.url || '',
        video_url: lesson.video_url || lesson.video?.url || '',
        video_duration: lesson.video_duration || lesson.video?.duration || '',
        video_provider_id: getLessonVideoProviderId(lesson.video),
        body: lesson.article?.body ?? '',
        project_description: lesson.project?.description ?? '',
        project_specs: JSON.stringify(lesson.project?.specs ?? {}, null, 2),
        isFree: lesson.isFree,
        locked: lesson.locked,
        order: lesson.order,
      })
      setQuizContent(lesson.quiz?.content ?? [])
      setQuizMode('editor')
      setQuizJson(JSON.stringify(lesson.quiz?.content ?? [], null, 2))
      setSlugManuallyEdited(false)
      setProductionPriority(
        normalizeLessonPriority(lesson.production?.priority),
      )
    }
  }, [lesson, isOpen])

  useEffect(() => {
    if (!isOpen) return
    // Mantém o JSON em sync quando o usuário edita pelo editor visual.
    setQuizJson(JSON.stringify(quizContent ?? [], null, 2))
  }, [quizContent, isOpen])

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
      if (!isOpen) return
      const token = getAuthTokenFromClient()
      if (!token) return

      try {
        const [{ skills }, config] = await Promise.all([
          listSkills(),
          getLessonSkillsConfig(lesson.id, token),
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
  }, [isOpen, lesson.id])

  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }))
    }
  }, [formData.title, slugManuallyEdited])

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
        lesson.id.toString(),
        payload,
        token,
      )
      await updateLessonSkillsConfig(
        lesson.id,
        lessonSkillsToPersist.map((item) => ({
          skillId: item.skillId,
          weight: item.weight,
        })),
        token,
      )

      const prevP = normalizeLessonPriority(lesson.production?.priority)
      const nextP = normalizeLessonPriority(productionPriority)
      let nextProduction = lesson.production ?? null
      if (prevP !== nextP) {
        try {
          const { item } = await updateLessonProduction(
            lesson.id,
            { priority: nextP },
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
            'Aula salva, mas não foi possível atualizar a prioridade no Kanban.',
          )
          nextProduction = lesson.production ?? null
        }
      }

      if (pendingSkill) {
        setLessonSkills(lessonSkillsToPersist)
        setSelectedSkillId('')
      }
      const savedVideo = (savedLesson as { video?: Parameters<typeof mapLessonVideoForState>[0] })
        .video
      onSave({
        ...lesson,
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
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar aula:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar aula')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isArticle = formData.type === 'article'
  const isFullScreen = formData.type === 'quiz' || formData.type === 'multi_quiz'

  return (
    <div
      className={[
        'cb-modal-overlay',
        isFullScreen ? 'items-stretch justify-stretch' : '',
      ].join(' ')}
    >
      <Card
        className={
          isFullScreen
            ? 'flex h-full max-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none border-0 shadow-none sm:border sm:shadow-sm'
            : isArticle
              ? 'cb-modal-card-lg'
              : 'cb-modal-card'
        }
      >
        <CardHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Editar Aula</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={isFullScreen ? "flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-6 pt-0" : "cb-modal-body"}>
          <div className={isFullScreen ? "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" : "cb-modal-scroll space-y-4"}>
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
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={quizMode === 'editor' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuizMode('editor')}
                    >
                      Editor
                    </Button>
                    <Button
                      type="button"
                      variant={quizMode === 'json' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuizMode('json')}
                    >
                      JSON
                    </Button>
                  </div>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                        className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
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
                          <span className="text-xs text-gray-500 dark:text-gray-400">
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

            <div className="rounded-lg border border-gray-200 dark:border-gray-700">
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
                  <div className="space-y-2">
                    <Label htmlFor="lesson-production-priority">
                      Prioridade no Kanban
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Etiqueta no quadro editorial; salve a aula para aplicar.
                    </p>
                    <Select
                      id="lesson-production-priority"
                      value={productionPriority}
                      onChange={(e) =>
                        setProductionPriority(
                          e.target.value as LessonProductionPriority,
                        )
                      }
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {priorityLabel(p)}
                        </option>
                      ))}
                    </Select>
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

          <div className="mt-4 flex shrink-0 flex-col gap-2 border-t border-border bg-card pt-4">
            {isFullScreen && (
              <p className="text-center text-xs text-muted-foreground">
                As alterações no editor só são gravadas no servidor ao clicar em{' '}
                <strong>Salvar</strong> (ou Ctrl+Enter no modo texto).
              </p>
            )}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
