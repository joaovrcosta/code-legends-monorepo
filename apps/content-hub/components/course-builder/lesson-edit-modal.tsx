'use client'

import { useState, useEffect } from 'react'
import { LessonWithStructure } from '@/actions/course/get-course-with-structure'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VideoDurationInput } from '@/components/ui/video-duration-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArticleBodyEditor } from './article-body-editor'
import { QuizEditor } from './quiz-editor'
import { Select } from '@/components/ui/select'
import type { Challenge } from '@/actions/lesson/list-lessons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateLesson } from '@/actions/lesson/update-lesson'
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
  const [availableSkills, setAvailableSkills] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([])
  const [lessonSkills, setLessonSkills] = useState<LessonSkillConfigItem[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')

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
        body: lesson.article?.body ?? '',
        project_description: lesson.project?.description ?? '',
        project_specs: JSON.stringify(lesson.project?.specs ?? {}, null, 2),
        isFree: lesson.isFree,
        locked: lesson.locked,
        order: lesson.order,
      })
      setQuizContent(lesson.quiz?.content ?? [])
      setSlugManuallyEdited(false)
    }
  }, [lesson, isOpen])

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

      const payload =
        formData.type === 'quiz' || formData.type === 'multi_quiz'
          ? { ...formData, quiz_content: quizContent }
          : formData.type === 'project'
            ? {
                ...formData,
                project_description: formData.project_description,
                project_specs: (() => {
                  try {
                    return JSON.parse(formData.project_specs || '{}')
                  } catch {
                    return {}
                  }
                })(),
              }
            : formData

      await updateLesson(lesson.id.toString(), payload, token)
      await updateLessonSkillsConfig(
        lesson.id,
        lessonSkillsToPersist.map((item) => ({
          skillId: item.skillId,
          weight: item.weight,
        })),
        token,
      )

      if (pendingSkill) {
        setLessonSkills(lessonSkillsToPersist)
        setSelectedSkillId('')
      }
      onSave({
        ...lesson,
        ...formData,
        url: formData.url || null,
        video_url: formData.video_url || null,
        video_duration: formData.video_duration || null,
        video:
          formData.type === 'video'
            ? {
                url: formData.video_url || null,
                duration: formData.video_duration || null,
              }
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
  const isFullScreen =
    isArticle || formData.type === 'quiz' || formData.type === 'multi_quiz'

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 ${
        isFullScreen ? 'flex' : 'flex items-center justify-center'
      }`}
    >
      <Card
        className={
          isFullScreen
            ? 'flex h-full max-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none border-0 shadow-none sm:border sm:shadow-sm'
            : 'flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden'
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
        <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-6 pt-0">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="video_url">URL do Vídeo</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) =>
                      setFormData({ ...formData, video_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_duration">Duração do Vídeo</Label>
                  <VideoDurationInput
                    id="video_duration"
                    value={formData.video_duration}
                    onChange={(video_duration) =>
                      setFormData({ ...formData, video_duration })
                    }
                  />
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
                <QuizEditor
                  challenges={quizContent}
                  onChange={setQuizContent}
                />
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
