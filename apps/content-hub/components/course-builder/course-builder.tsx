"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  getCourseWithStructure,
  ModuleWithStructure,
} from "@/actions/course/get-course-with-structure";
import { mergeProductionFromModules } from "@/lib/course-structure";
import { ModuleNode } from "./module-node";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileJson, X, Upload } from "lucide-react";
import { createModule } from "@/actions/module/create-module";
import { createGroup } from "@/actions/group/create-group";
import {
  createLesson,
  type CreateLessonData,
} from "@/actions/lesson/create-lesson";
import { deleteModule } from "@/actions/module/delete-module";
import {
  updateLessonProduction,
  type UpdateLessonProductionInput,
} from "@/actions/lesson/update-lesson-production";
import { getAuthTokenFromClient } from "@/lib/auth";
import {
  normalizeLessonPriority,
  normalizeLessonProductionStatus,
  validateLessonProductionNotesLength,
} from "@/lib/lesson-production-labels";
import { generateSlug, allocateUniqueSlug, allocateUniqueTitle } from "@/lib/utils";
import {
  appendVideoIssueNote,
  formatVideoIssueNote,
} from "@/lib/lesson-video-issue";
import { toast } from "sonner";

interface ImportLessonData {
  title: string;
  description?: string;
  type?: string;
  slug?: string;
  url?: string;
  video_url?: string;
  video_duration?: string;
  isFree?: boolean;
  locked?: boolean;
  order?: number;
  body?: string;
  quiz_content?: unknown[];
  project_description?: string;
  project_specs?: unknown;
  production_status?: string;
  production_priority?: string;
  production_notes?: string | null;
}

interface ImportGroupData {
  title: string;
  orderIndex?: number;
  lessons: ImportLessonData[];
}

interface ImportModuleData {
  title: string;
  slug?: string;
  orderIndex?: number;
  groups: ImportGroupData[];
}

function hasImportProductionFields(lesson: ImportLessonData): boolean {
  return (
    lesson.production_status !== undefined ||
    lesson.production_priority !== undefined ||
    lesson.production_notes !== undefined
  );
}

function buildImportProductionInput(
  lesson: ImportLessonData,
  videoWarnings?: string[],
): UpdateLessonProductionInput | null {
  const input: UpdateLessonProductionInput = {};

  if (lesson.production_status !== undefined) {
    input.status = normalizeLessonProductionStatus(lesson.production_status);
  }
  if (lesson.production_priority !== undefined) {
    input.priority = normalizeLessonPriority(lesson.production_priority);
  }

  let notes = lesson.production_notes;
  if (videoWarnings?.length) {
    notes = appendVideoIssueNote(notes, videoWarnings);
  }

  if (notes !== undefined) {
    const notesLengthError = validateLessonProductionNotesLength(notes ?? "");
    if (notesLengthError) {
      throw new Error(notesLengthError);
    }
    input.notes = notes;
  } else if (videoWarnings?.length) {
    const note = formatVideoIssueNote(videoWarnings);
    const notesLengthError = validateLessonProductionNotesLength(note);
    if (notesLengthError) {
      throw new Error(notesLengthError);
    }
    input.notes = note;
  }

  return Object.keys(input).length > 0 ? input : null;
}

function buildExportDownloadSuffix(
  includeContent: boolean,
  includeKanban: boolean,
  includeNotes: boolean,
): string {
  const parts = ["estrutura"];
  if (includeContent) parts.push("conteudo");
  if (includeKanban) parts.push("kanban");
  if (includeNotes) parts.push("anotacoes");
  return parts.join("-");
}

function countImportSteps(
  data: ImportModuleData[],
  existingModuleCount: number,
  clearBefore: boolean,
): number {
  let steps = clearBefore ? existingModuleCount : 0;
  for (const module of data) {
    if (!module?.title) continue;
    steps += 1;
    for (const group of module.groups || []) {
      if (!group?.title) continue;
      steps += 1;
      for (const lesson of group.lessons || []) {
        if (!lesson?.title) continue;
        steps += 1;
        if (hasImportProductionFields(lesson)) steps += 1;
      }
    }
  }
  return Math.max(steps, 1);
}

function formatImportEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "quase pronto";
  if (seconds < 60) return `~${Math.ceil(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return secs > 0 ? `~${minutes} min ${secs} s` : `~${minutes} min`;
}

async function fetchCourseModules(
  courseId: string,
  token: string,
): Promise<ModuleWithStructure[]> {
  const structure = await getCourseWithStructure(courseId, {
    includeContent: false,
    token,
  });
  return structure?.modules ?? [];
}

async function clearCourseStructureForImport(
  courseId: string,
  token: string,
  onModuleDeleted?: () => void,
): Promise<{ ok: true; deletedCount: number } | { ok: false; error: string }> {
  const deleteErrors: string[] = [];
  let deletedCount = 0;

  const existing = await fetchCourseModules(courseId, token);
  for (const module of existing) {
    try {
      await deleteModule(module.id, token);
      deletedCount += 1;
      onModuleDeleted?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      deleteErrors.push(`"${module.title}": ${message}`);
    }
  }

  if (deleteErrors.length > 0) {
    return {
      ok: false,
      error: `Não foi possível apagar a estrutura atual:\n${deleteErrors.join("\n")}\n\nImportação cancelada para evitar conflito de slug.`,
    };
  }

  const remaining = await fetchCourseModules(courseId, token);
  if (remaining.length > 0) {
    return {
      ok: false,
      error: `Ainda restam ${remaining.length} módulo(s) após a limpeza. Importação cancelada para evitar conflito de slug.`,
    };
  }

  return { ok: true, deletedCount };
}

interface CourseBuilderProps {
  courseId: string;
  courseTitle: string;
  modules: ModuleWithStructure[];
  onModulesChange: (modules: ModuleWithStructure[]) => void;
  onReloadStructure?: () => void;
  courseSkillIds?: string[];
}

export function CourseBuilder({
  courseId,
  courseTitle,
  modules,
  onModulesChange,
  onReloadStructure,
  courseSkillIds,
}: CourseBuilderProps) {
  const storageKey = `cb:${courseId}:expandedModules`;
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => {
      if (typeof window === "undefined") return new Set();
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return new Set(modules.map((m) => m.id));
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed.map(String));
      } catch {}
      return new Set(modules.map((m) => m.id));
    },
  );
  const [collapseAllKey, setCollapseAllKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showStructureModal, setShowStructureModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [clearBeforeImport, setClearBeforeImport] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importEtaSeconds, setImportEtaSeconds] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportIncludeContent, setExportIncludeContent] = useState(false);
  const [exportIncludeKanban, setExportIncludeKanban] = useState(false);
  const [exportIncludeNotes, setExportIncludeNotes] = useState(false);
  const [exportModulesWithContent, setExportModulesWithContent] =
    useState<ModuleWithStructure[] | null>(null);
  const [exportContentLoading, setExportContentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showStructureModal || !exportIncludeContent) {
      setExportModulesWithContent(null);
      setExportContentLoading(false);
      return;
    }

    let cancelled = false;

    const loadExportContent = async () => {
      setExportContentLoading(true);
      try {
        const token = getAuthTokenFromClient();
        const structure = await getCourseWithStructure(courseId, {
          includeContent: true,
          token: token ?? undefined,
        });
        if (cancelled || !structure) {
          if (!cancelled) {
            toast.error("Erro ao carregar conteúdo para exportação");
          }
          return;
        }

        setExportModulesWithContent(
          mergeProductionFromModules(structure.modules, modules),
        );
      } catch (error) {
        console.error("Erro ao carregar conteúdo para exportação:", error);
        if (!cancelled) {
          toast.error("Erro ao carregar conteúdo para exportação");
        }
      } finally {
        if (!cancelled) {
          setExportContentLoading(false);
        }
      }
    };

    void loadExportContent();

    return () => {
      cancelled = true;
    };
  }, [showStructureModal, exportIncludeContent, courseId, modules]);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...newExpanded]));
    } catch {}
  };

  const handleAddModule = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }

      const moduleNumber = modules.length + 1;
      const moduleTitle = `Módulo ${moduleNumber}`;
      const newModule = await createModule(
        courseId,
        {
          title: moduleTitle,
          slug: generateSlug(moduleTitle),
        },
        token,
      );

      const updatedModules = [
        ...modules,
        {
          id: newModule.module.id,
          title: newModule.module.title,
          slug: newModule.module.slug,
          courseId: newModule.module.courseId,
          orderIndex: modules.length,
          groups: [],
        },
      ];

      onModulesChange(updatedModules);
      // Por padrão, a árvore começa colapsada.
    } catch (error: any) {
      console.error("Erro ao criar módulo:", error);
      const errorMessage = error?.message || "Erro ao criar módulo";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleUpdate = (
    moduleId: string,
    updatedModule: ModuleWithStructure,
  ) => {
    const updatedModules = modules.map((m) =>
      m.id === moduleId ? updatedModule : m,
    );
    onModulesChange(updatedModules);
  };

  const handleModuleDelete = (moduleId: string) => {
    const updatedModules = modules.filter((m) => m.id !== moduleId);
    onModulesChange(updatedModules);
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      newSet.delete(moduleId);
      return newSet;
    });
  };

  const modulesForExport =
    exportIncludeContent && exportModulesWithContent
      ? exportModulesWithContent
      : modules;

  const buildExportJson = useCallback(
    (
      sourceModules: ModuleWithStructure[],
      includeContent: boolean,
      includeKanban: boolean,
      includeNotes: boolean,
    ) => {
      const exportModules = sourceModules.map((module) => ({
        title: module.title,
        slug: module.slug,
        orderIndex: module.orderIndex,
        groups: module.groups.map((group) => ({
          title: group.title,
          orderIndex: group.orderIndex,
          lessons: group.lessons.map((lesson) => {
            const base: Record<string, unknown> = {
              title: lesson.title,
              description: lesson.description,
              type: lesson.type,
              slug: lesson.slug,
              url: lesson.url ?? undefined,
              video_url: lesson.video_url ?? undefined,
              video_duration: lesson.video_duration ?? undefined,
              isFree: lesson.isFree,
              locked: lesson.locked,
              order: lesson.order,
            };
            if (includeContent) {
              const t = (lesson.type ?? "").toString().trim().toLowerCase();
              const body = lesson.article?.body?.trim();
              if ((t === "article" || t === "text") && body) {
                base.body = lesson.article!.body;
              }
              if (
                (t === "quiz" || t === "multi_quiz") &&
                Array.isArray(lesson.quiz?.content)
              ) {
                base.quiz_content = lesson.quiz!.content;
              }
              if (t === "project" && lesson.project) {
                const desc = lesson.project.description?.trim();
                if (desc) base.project_description = lesson.project.description;
                if (lesson.project.specs != null) {
                  base.project_specs = lesson.project.specs;
                }
              }
            }
            if (includeKanban) {
              base.production_status = normalizeLessonProductionStatus(
                lesson.production?.status,
              );
              base.production_priority = normalizeLessonPriority(
                lesson.production?.priority,
              );
            }
            if (includeNotes) {
              const notes = lesson.production?.notes?.trim() ?? "";
              if (notes) {
                base.production_notes = lesson.production!.notes;
              }
            }
            return base;
          }),
        })),
      }));

      return JSON.stringify(exportModules, null, 2);
    },
    [],
  );

  const handleDownloadJson = () => {
    if (exportIncludeContent && exportContentLoading) {
      toast.error("Aguarde o carregamento do conteúdo para exportação");
      return;
    }

    try {
      const json = buildExportJson(
        modulesForExport,
        exportIncludeContent,
        exportIncludeKanban,
        exportIncludeNotes,
      );
      const safeTitle =
        courseTitle && courseTitle.trim().length > 0
          ? generateSlug(courseTitle)
          : courseId;
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = buildExportDownloadSuffix(
        exportIncludeContent,
        exportIncludeKanban,
        exportIncludeNotes,
      );
      a.download = `curso-${safeTitle}-${courseId}-${suffix}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar JSON da estrutura:", error);
      toast.error("Erro ao baixar JSON da estrutura");
    }
  };

  const handleImportStructure = async () => {
    if (!importJson.trim()) {
      setImportError("Por favor, insira o JSON com a estrutura do curso");
      return;
    }

    let data: ImportModuleData[];
    try {
      data = JSON.parse(importJson);
    } catch {
      setImportError("JSON inválido. Verifique a sintaxe.");
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      setImportError("O JSON deve ser um array de módulos com grupos e aulas");
      return;
    }

    const token = getAuthTokenFromClient();
    if (!token) {
      setImportError("Token de autenticação não encontrado");
      return;
    }

    let modulesToDeleteCount = 0;
    if (clearBeforeImport) {
      const existingModules = await fetchCourseModules(courseId, token);
      modulesToDeleteCount = existingModules.length;
    }

    const totalSteps = countImportSteps(
      data,
      modulesToDeleteCount,
      clearBeforeImport,
    );
    let completedSteps = 0;
    let videoIssueCount = 0;
    let renamedModuleCount = 0;
    let renamedGroupCount = 0;
    let renamedLessonCount = 0;
    const importErrors: string[] = [];
    const importStartedAt = Date.now();

    const tickImportProgress = () => {
      completedSteps += 1;
      const percent = Math.min(
        100,
        Math.round((completedSteps / totalSteps) * 100),
      );
      setImportProgress(percent);
      if (completedSteps > 0) {
        const elapsedSec = (Date.now() - importStartedAt) / 1000;
        const avgSecPerStep = elapsedSec / completedSteps;
        setImportEtaSeconds((totalSteps - completedSteps) * avgSecPerStep);
      }
    };

    try {
      setImportLoading(true);
      setImportProgress(0);
      setImportEtaSeconds(null);
      setImportError(null);

      const usedModuleSlugs = new Set<string>();

      if (clearBeforeImport) {
        const clearResult = await clearCourseStructureForImport(
          courseId,
          token,
          tickImportProgress,
        );
        if (!clearResult.ok) {
          setImportError(clearResult.error);
          return;
        }
      } else {
        const existingModules = await fetchCourseModules(courseId, token);
        for (const module of existingModules) {
          usedModuleSlugs.add(module.slug.toLowerCase());
        }
      }

      for (let moduleIndex = 0; moduleIndex < data.length; moduleIndex++) {
        const module = data[moduleIndex];
        if (!module?.title) continue;

        try {
          const baseModuleSlug = module.slug || generateSlug(module.title);
          const moduleSlug = allocateUniqueSlug(baseModuleSlug, usedModuleSlugs);
          if (moduleSlug !== baseModuleSlug.toLowerCase()) {
            renamedModuleCount += 1;
          }

          const createdModule = await createModule(
            courseId,
            {
              title: module.title,
              slug: moduleSlug,
            },
            token,
          );

          const moduleId = createdModule.module.id;
          tickImportProgress();
          const groups = module.groups || [];
          const usedGroupTitles = new Set<string>();

          for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            const group = groups[groupIndex];
            if (!group?.title) continue;

            try {
              const baseGroupTitle = group.title;
              const groupTitle = allocateUniqueTitle(
                baseGroupTitle,
                usedGroupTitles,
              );
              if (groupTitle !== baseGroupTitle) {
                renamedGroupCount += 1;
              }

              const createdGroup = await createGroup(
                moduleId,
                { title: groupTitle },
                token,
              );

              const groupId = createdGroup.group.id;
              tickImportProgress();
              const lessons = group.lessons || [];
              const usedLessonSlugs = new Set<string>();

              for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
                const lesson = lessons[lessonIndex];
                if (!lesson?.title) continue;

                try {
                  const baseLessonSlug =
                    lesson.slug || generateSlug(lesson.title);
                  const slug = allocateUniqueSlug(baseLessonSlug, usedLessonSlugs);
                  if (slug !== baseLessonSlug.toLowerCase()) {
                    renamedLessonCount += 1;
                  }

                  const rawDescription = (lesson.description ?? "").toString();
                  const description = rawDescription;
                  const rawType = (lesson.type ?? "video").toString().toLowerCase();
                  const allowedTypes = [
                    "video",
                    "article",
                    "text",
                    "quiz",
                    "multi_quiz",
                    "project",
                  ];
                  const normalizedType = allowedTypes.includes(rawType)
                    ? rawType
                    : "video";
                  const lessonData: CreateLessonData = {
                    title: lesson.title,
                    description,
                    type: normalizedType,
                    slug,
                    url: lesson.url,
                    video_url: lesson.video_url,
                    video_duration: lesson.video_duration,
                    isFree: lesson.isFree ?? false,
                    locked: lesson.locked ?? false,
                    order: lesson.order ?? lessonIndex + 1,
                  };

                  if (
                    (normalizedType === "article" || normalizedType === "text") &&
                    typeof lesson.body === "string"
                  ) {
                    lessonData.body = lesson.body;
                  }
                  if (
                    (normalizedType === "quiz" ||
                      normalizedType === "multi_quiz") &&
                    Array.isArray(lesson.quiz_content)
                  ) {
                    lessonData.quiz_content = lesson.quiz_content;
                  }
                  if (normalizedType === "project") {
                    if (typeof lesson.project_description === "string") {
                      lessonData.project_description = lesson.project_description;
                    }
                    if (lesson.project_specs !== undefined) {
                      lessonData.project_specs = lesson.project_specs;
                    }
                  }

                  const createdLesson = await createLesson(
                    groupId,
                    lessonData,
                    token,
                  );
                  tickImportProgress();

                  if (createdLesson.videoWarnings?.length) {
                    videoIssueCount += 1;
                  }

                  if (
                    hasImportProductionFields(lesson) ||
                    createdLesson.videoWarnings?.length
                  ) {
                    const productionInput = buildImportProductionInput(
                      lesson,
                      createdLesson.videoWarnings,
                    );
                    if (productionInput) {
                      const lessonId = parseInt(createdLesson.lesson.id, 10);
                      await updateLessonProduction(
                        lessonId,
                        productionInput,
                        token,
                      );
                      tickImportProgress();
                    }
                  }
                } catch (error: unknown) {
                  const message =
                    error instanceof Error ? error.message : "Erro desconhecido";
                  importErrors.push(
                    `Aula "${lesson.title ?? `Aula ${lessonIndex + 1}`}": ${message}`,
                  );
                  tickImportProgress();
                }
              }
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Erro desconhecido";
              importErrors.push(
                `Grupo "${group.title ?? `Grupo ${groupIndex + 1}`}" (módulo "${module.title}"): ${message}`,
              );
              tickImportProgress();
            }
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Erro desconhecido";
          importErrors.push(`Módulo "${module.title}": ${message}`);
          tickImportProgress();
        }
      }

      setImportProgress(100);
      setImportEtaSeconds(0);

      if (importErrors.length > 0) {
        setImportError(
          `${importErrors.length} item(ns) não importado(s):\n${importErrors.slice(0, 5).join("\n")}${
            importErrors.length > 5
              ? `\n... e mais ${importErrors.length - 5} erro(s)`
              : ""
          }`,
        );
      } else {
        setImportError(null);
      }

      if (renamedModuleCount > 0) {
        toast.info(
          `${renamedModuleCount} módulo(s) importado(s) com slug ajustado para evitar duplicata.`,
        );
      }
      if (renamedGroupCount > 0) {
        toast.info(
          `${renamedGroupCount} grupo(s) importado(s) com título ajustado para evitar duplicata.`,
        );
      }
      if (renamedLessonCount > 0) {
        toast.info(
          `${renamedLessonCount} aula(s) importada(s) com slug ajustado para evitar duplicata.`,
        );
      }

      if (videoIssueCount > 0) {
        toast.warning(
          `${videoIssueCount} aula(s) importada(s) com problema no vídeo. Veja o aviso ao lado do título.`,
        );
      }

      if (importErrors.length === 0) {
        toast.success("Estrutura do curso importada com sucesso!");
        setShowStructureModal(false);
        setImportJson("");
      } else {
        toast.success("Importação concluída com avisos.");
      }

      if (onReloadStructure) {
        onReloadStructure();
      }
    } catch (error: any) {
      console.error("Erro ao importar estrutura do curso:", error);
      setImportError(
        error?.message || "Erro ao importar estrutura do curso. Tente novamente.",
      );
    } finally {
      setImportLoading(false);
      setImportProgress(0);
      setImportEtaSeconds(null);
    }
  };

  const exportJson = useMemo(() => {
    if (exportIncludeContent && exportContentLoading) {
      return "Carregando conteúdo para exportação…";
    }

    return buildExportJson(
      modulesForExport,
      exportIncludeContent,
      exportIncludeKanban,
      exportIncludeNotes,
    );
  }, [
    buildExportJson,
    modulesForExport,
    exportIncludeContent,
    exportIncludeKanban,
    exportIncludeNotes,
    exportContentLoading,
  ]);

  const typeCounts = useMemo(() => {
    const counts = {
      video: 0,
      article: 0,
      quiz: 0,
      multi_quiz: 0,
      project: 0,
      text: 0,
      other: 0,
    };

    for (const m of modules) {
      for (const g of m.groups) {
        for (const l of g.lessons) {
          const t = (l.type ?? "").toString().trim().toLowerCase();
          if (t === "video") counts.video += 1;
          else if (t === "article") counts.article += 1;
          else if (t === "quiz") counts.quiz += 1;
          else if (t === "multi_quiz") counts.multi_quiz += 1;
          else if (t === "project") counts.project += 1;
          else if (t === "text") counts.text += 1;
          else counts.other += 1;
        }
      }
    }
    return counts;
  }, [modules]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Estrutura do Curso
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-sky-700 dark:text-sky-300">
              Vídeos: {typeCounts.video}
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">
              Leituras: {typeCounts.article}
            </span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-violet-700 dark:text-violet-300">
              Quiz: {typeCounts.quiz}
            </span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-violet-700 dark:text-violet-300">
              Multi quiz: {typeCounts.multi_quiz}
            </span>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-orange-700 dark:text-orange-300">
              Projetos: {typeCounts.project}
            </span>
            {typeCounts.text > 0 && (
              <span className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">
                Texto: {typeCounts.text}
              </span>
            )}
            {typeCounts.other > 0 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">
                Outros: {typeCounts.other}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExpandedModules(new Set());
              setCollapseAllKey((k) => k + 1);
              try {
                window.localStorage.setItem(storageKey, JSON.stringify([]));
              } catch {}
            }}
          >
            Fechar tudo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStructureModal(true)}
          >
            <FileJson className="mr-2 h-4 w-4" />
            Estrutura JSON
          </Button>
          <Button onClick={handleAddModule} disabled={loading} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Módulo
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {modules.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum módulo cadastrado. Clique em "Adicionar Módulo" para começar.
          </div>
        ) : (
          modules
            .filter((module) => module.id) // Filtrar módulos sem ID válido
            .map((module, idx) => (
              <ModuleNode
                key={module.id}
                module={module}
                moduleNumber={idx + 1}
                collapseAllKey={collapseAllKey}
                isExpanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                onUpdate={(updated) => handleModuleUpdate(module.id, updated)}
                onDelete={() => handleModuleDelete(module.id)}
                onReloadStructure={onReloadStructure}
                courseSkillIds={courseSkillIds}
                courseTitle={courseTitle}
                modules={modules}
              />
            ))
        )}
      </div>

      {showStructureModal && (
        <div className="cb-modal-overlay">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Exportar / Importar Estrutura do Curso
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowStructureModal(false);
                    setImportError(null);
                    setImportProgress(0);
                    setImportEtaSeconds(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use esta ferramenta para copiar a estrutura completa de
                    módulos, grupos e aulas de um curso, ou importar a estrutura
                    em outro curso. Marque as opções abaixo para incluir no JSON
                    o conteúdo das aulas, informações do Kanban (status e
                    prioridade) e anotações editoriais. Na importação, esses
                    campos são restaurados automaticamente quando presentes no
                    arquivo.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="exportIncludeContent"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={exportIncludeContent}
                        onChange={(e) =>
                          setExportIncludeContent(e.target.checked)
                        }
                      />
                      <label
                        htmlFor="exportIncludeContent"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Incluir conteúdo das aulas (corpo, quiz, projeto) para
                        importação completa
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="exportIncludeKanban"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={exportIncludeKanban}
                        onChange={(e) =>
                          setExportIncludeKanban(e.target.checked)
                        }
                      />
                      <label
                        htmlFor="exportIncludeKanban"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Incluir informações do Kanban (status e prioridade)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="exportIncludeNotes"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={exportIncludeNotes}
                        onChange={(e) =>
                          setExportIncludeNotes(e.target.checked)
                        }
                      />
                      <label
                        htmlFor="exportIncludeNotes"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Incluir anotações
                      </label>
                    </div>
                  </div>
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Estrutura atual (somente leitura)
                  </label>
                  <Textarea
                    value={exportJson}
                    readOnly
                    rows={12}
                    className="font-mono text-xs"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(exportJson);
                        toast.success("JSON copiado para a área de transferência");
                      }}
                    >
                      Copiar JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                      Baixar .json
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Importar nova estrutura (substitui ou adiciona módulos)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const text = reader.result;
                          if (typeof text === "string") {
                            setImportJson(text);
                            setImportError(null);
                            toast.success("Arquivo carregado. Revise e clique em Importar Estrutura.");
                          }
                        };
                        reader.onerror = () => {
                          toast.error("Erro ao ler o arquivo");
                        };
                        reader.readAsText(file, "utf-8");
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={importLoading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar arquivo .json
                    </Button>
                  </div>
                  <Textarea
                    placeholder='[\n  {\n    "title": "Módulo 1",\n    "groups": [\n      {\n        "title": "Grupo 1",\n        "lessons": [\n          {\n            "title": "Introdução",\n            "description": "Descrição da aula",\n            "type": "video",\n            "slug": "introducao",\n            "isFree": false,\n            "locked": false,\n            "order": 1\n          }\n        ]\n      }\n    ]\n  }\n]'
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                    disabled={importLoading}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      id="clearBeforeImport"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={clearBeforeImport}
                      disabled={importLoading}
                      onChange={(e) => setClearBeforeImport(e.target.checked)}
                    />
                    <label
                      htmlFor="clearBeforeImport"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Apagar estrutura atual antes de importar (substituição
                      completa)
                    </label>
                  </div>

                  {importLoading && (
                    <div
                      className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Importando estrutura…
                        </span>
                        <span className="tabular-nums text-gray-600 dark:text-gray-400">
                          {importProgress}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Tempo restante estimado:{" "}
                        {importProgress < 3 || importEtaSeconds === null
                          ? "calculando…"
                          : formatImportEta(importEtaSeconds)}
                      </p>
                    </div>
                  )}

                  {importError && (
                    <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 whitespace-pre-line">
                      {importError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowStructureModal(false);
                        setImportError(null);
                        setImportProgress(0);
                        setImportEtaSeconds(null);
                      }}
                      disabled={importLoading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleImportStructure} disabled={importLoading}>
                      {importLoading ? "Importando…" : "Importar Estrutura"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
