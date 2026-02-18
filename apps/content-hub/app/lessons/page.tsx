"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { listLessons, deleteLesson, getLessonBySlug, type Lesson, type LessonDetail } from "@/actions/lesson";
import { listGroups } from "@/actions/group";
import { listModules } from "@/actions/module";
import { listCourses } from "@/actions/course";
import { getAuthTokenFromClient } from "@/lib/auth";
import { createLesson, type CreateLessonData } from "@/actions/lesson";
import { Plus, Edit, Trash2, Upload, Eye } from "lucide-react";
import { LessonDetailsModal } from "@/components/ui/lesson-details-modal";
import Link from "next/link";
import { toast } from "sonner";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);
  const [groups, setGroups] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<number>(0);
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
    } else {
      setModules([]);
      setSelectedModule("");
      setGroups([]);
      setSelectedGroup("");
      setLessons([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      loadGroups();
    } else {
      setGroups([]);
      setSelectedGroup("");
      setLessons([]);
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedGroup) {
      loadLessons();
    } else {
      setLessons([]);
    }
  }, [selectedGroup]);

  const loadCourses = async () => {
    try {
      const { courses } = await listCourses();
      setCourses(courses.map((c) => ({ id: c.id, title: c.title })));
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  };

  const loadModules = async () => {
    try {
      const { modules } = await listModules(selectedCourse);
      setModules(modules.map((m) => ({ id: m.id, title: m.title })));
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
    }
  };

  const loadGroups = async () => {
    try {
      const { groups } = await listGroups(selectedModule);
      setGroups(groups.map((g) => ({ id: g.id, title: g.title })));
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    }
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      const { lessons: data } = await listLessons(Number(selectedGroup));
      setLessons(data);
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    try {
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      await deleteLesson(id, token);
      loadLessons();
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir aula");
    }
  };

  const handleImportJson = async () => {
    if (!selectedGroup) {
      toast.error("Selecione um submódulo antes de importar");
      return;
    }

    if (!importJson.trim()) {
      setImportError("Por favor, cole o JSON das aulas");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportSuccess(0);

    try {
      // Parse do JSON
      let lessonsData: any[];
      try {
        lessonsData = JSON.parse(importJson);
      } catch (error) {
        setImportError("JSON inválido. Verifique a formatação.");
        setImporting(false);
        return;
      }

      if (!Array.isArray(lessonsData)) {
        setImportError("O JSON deve ser um array de aulas");
        setImporting(false);
        return;
      }

      const token = getAuthTokenFromClient();
      if (!token) {
        setImportError("Token de autenticação não encontrado");
        setImporting(false);
        return;
      }

      let successCount = 0;
      const errors: string[] = [];

      // Mapear e criar cada aula
      for (let i = 0; i < lessonsData.length; i++) {
        const lesson = lessonsData[i];
        try {
          // Mapear os dados do JSON para o formato esperado
          const lessonData: CreateLessonData = {
            title: lesson.title || "",
            description: lesson.description || "",
            type: lesson.type?.toLowerCase() || "video", // Converter para maiúsculas
            slug: lesson.slug || "",
            url: lesson.url || "",
            isFree: lesson.isFree ?? false,
            video_url: lesson.video_url || "",
            video_duration: lesson.video_duration || "",
            locked: lesson.locked ?? false,
            order: lesson.order ?? i + 1,
          };

          // Validar campos obrigatórios
          if (!lessonData.title || !lessonData.description || !lessonData.slug) {
            errors.push(`Aula ${i + 1}: Campos obrigatórios faltando (title, description, slug)`);
            continue;
          }

          await createLesson(Number(selectedGroup), lessonData, token);
          successCount++;
        } catch (error: any) {
          errors.push(`Aula ${i + 1} (${lesson.title || "sem título"}): ${error.message || "Erro desconhecido"}`);
        }
      }

      setImportSuccess(successCount);
      if (errors.length > 0) {
        setImportError(`${errors.length} erro(s) ao importar:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... e mais ${errors.length - 5} erro(s)` : ""}`);
      }

      // Recarregar a lista de aulas
      if (successCount > 0) {
        loadLessons();
      }
    } catch (error: any) {
      setImportError(error.message || "Erro ao importar aulas");
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportJson("");
    setImportError(null);
    setImportSuccess(0);
  };

  const handleViewDetails = async (slug: string) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        setShowDetailsModal(false);
        return;
      }
      const lesson = await getLessonBySlug(slug, token);
      if (lesson) {
        setSelectedLesson(lesson);
      } else {
        toast.error("Aula não encontrada");
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da aula:", error);
      toast.error("Erro ao carregar detalhes da aula");
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Aulas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as aulas dos submódulos</p>
          </div>
          {selectedGroup && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar JSON
              </Button>
              <Link href={`/lessons/new?groupId=${selectedGroup}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Aula
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione Curso, Módulo e Submódulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Curso</label>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Módulo</label>
                <Select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedCourse}
                >
                  <option value="">Selecione um módulo</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Submódulo</label>
                <Select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={!selectedModule}
                >
                  <option value="">Selecione um submódulo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id.toString()}>
                      {group.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedGroup && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Gratuita</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhuma aula encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">{lesson.title}</TableCell>
                          <TableCell>{lesson.type}</TableCell>
                          <TableCell>{lesson.slug}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                lesson.isFree
                                  ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-900/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  lesson.isFree
                                    ? "bg-emerald-700 dark:bg-emerald-400"
                                    : "bg-amber-700 dark:bg-amber-400"
                                }`}
                              />
                              {lesson.isFree ? "Sim" : "Não"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                lesson.locked
                                  ? "bg-red-900/20 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                                  : "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  lesson.locked
                                    ? "bg-red-700 dark:bg-red-400"
                                    : "bg-emerald-700 dark:bg-emerald-400"
                                }`}
                              />
                              {lesson.locked ? "Bloqueada" : "Disponível"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(lesson.slug)}
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Link href={`/lessons/${lesson.slug}/edit`}>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(lesson.id.toString())}
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de Importação */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Importar Aulas via JSON</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="json-input">Cole o JSON das aulas:</Label>
                  <Textarea
                    id="json-input"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder='[\n  {\n    "title": "Título da Aula",\n    "description": "Descrição...",\n    "type": "video",\n    "slug": "slug-da-aula",\n    ...\n  }\n]'
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>

                {importError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 whitespace-pre-wrap">{importError}</p>
                  </div>
                )}

                {importSuccess > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      {importSuccess} aula(s) importada(s) com sucesso!
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseImportModal}
                    disabled={importing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleImportJson}
                    disabled={importing || !importJson.trim()}
                  >
                    {importing ? "Importando..." : "Importar Aulas"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Detalhes da Aula */}
        <LessonDetailsModal
          lesson={selectedLesson}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLesson(null);
          }}
          loading={loadingDetails}
        />
      </div>
    </MainLayout>
  );
}

