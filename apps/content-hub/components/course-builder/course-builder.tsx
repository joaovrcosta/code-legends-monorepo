"use client";

import { useMemo, useState, useRef } from "react";
import { ModuleWithStructure } from "@/actions/course/get-course-with-structure";
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
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";

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
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const buildExportJson = () => {
    const exportModules = modules.map((module) => ({
      title: module.title,
      slug: module.slug,
      orderIndex: module.orderIndex,
      groups: module.groups.map((group) => ({
        title: group.title,
        orderIndex: group.orderIndex,
        lessons: group.lessons.map((lesson) => ({
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
        })),
      })),
    }));

    return JSON.stringify(exportModules, null, 2);
  };

  const handleDownloadJson = () => {
    try {
      const json = buildExportJson();
      const safeTitle =
        courseTitle && courseTitle.trim().length > 0
          ? generateSlug(courseTitle)
          : courseId;
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `curso-${safeTitle}-${courseId}-estrutura.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar JSON da estrutura:", error);
      toast.error("Erro ao baixar JSON da estrutura");
    }
  };

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

    try {
      setImportLoading(true);
      setImportError(null);

      if (clearBeforeImport && modules.length > 0) {
        for (const module of modules) {
          try {
            await deleteModule(module.id, token);
          } catch (error: any) {
            console.error("Erro ao excluir módulo:", error);
            // continua para tentar importar o restante
          }
        }
      }

      for (let moduleIndex = 0; moduleIndex < data.length; moduleIndex++) {
        const module = data[moduleIndex];
        if (!module?.title) continue;

        const moduleSlug = module.slug || generateSlug(module.title);
        const createdModule = await createModule(
          courseId,
          {
            title: module.title,
            slug: moduleSlug,
          },
          token,
        );

        const moduleId = createdModule.module.id;
        const groups = module.groups || [];

        for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
          const group = groups[groupIndex];
          if (!group?.title) continue;

          const createdGroup = await createGroup(
            moduleId,
            { title: group.title },
            token,
          );

          const groupId = createdGroup.group.id;
          const lessons = group.lessons || [];

          for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
            const lesson = lessons[lessonIndex];
            if (!lesson?.title) continue;

            const slug = lesson.slug || generateSlug(lesson.title);
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

            await createLesson(groupId, lessonData, token);
          }
        }
      }

      toast.success("Estrutura do curso importada com sucesso!");
      setShowStructureModal(false);
      setImportJson("");
      setImportError(null);
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
    }
  };

  const exportJson = buildExportJson();

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
              />
            ))
        )}
      </div>

      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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
                    em outro curso.
                  </p>
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
                  />
                  <div className="flex items-center gap-2">
                    <input
                      id="clearBeforeImport"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={clearBeforeImport}
                      onChange={(e) => setClearBeforeImport(e.target.checked)}
                    />
                    <label
                      htmlFor="clearBeforeImport"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Apagar estrutura atual antes de importar
                    </label>
                  </div>

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
                      }}
                      disabled={importLoading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleImportStructure} disabled={importLoading}>
                      {importLoading ? "Importando..." : "Importar Estrutura"}
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
