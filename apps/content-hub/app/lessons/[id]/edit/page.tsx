"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonBySlug, updateLesson, type UpdateLessonData } from "@/actions/lesson";
import { listInstructors } from "@/actions/user";
import { listGroups } from "@/actions/group";
import { listModules } from "@/actions/module";
import { listCourses } from "@/actions/course";
import { InstructorSelect } from "@/components/ui/instructor-select";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [lessonRealId, setLessonRealId] = useState<string | number>("");
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string; avatar?: string | null }>>([]);
  const [submodules, setSubmodules] = useState<Array<{ id: number; title: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [formData, setFormData] = useState<UpdateLessonData>({
    title: "",
    description: "",
    type: "video",
    slug: "",
    url: "",
    isFree: false,
    video_url: "",
    video_duration: "",
    locked: false,
    order: 0,
    authorId: "",
    submoduleId: undefined,
  });

  // Gera slug automaticamente quando o título mudar
  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title ?? ""),
      }));
    }
  }, [formData.title, slugManuallyEdited]);

  useEffect(() => {
    loadInstructors();
    loadCourses();
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
    } else {
      setModules([]);
      setSelectedModule("");
      setSubmodules([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      loadSubmodules();
    } else {
      setSubmodules([]);
    }
  }, [selectedModule]);

  const loadInstructors = async () => {
    try {
      const token = getAuthTokenFromClient();
      const { instructors: instructorsList } = await listInstructors(token || undefined);
      setInstructors(
        instructorsList.map((instructor) => ({
          id: instructor.id,
          name: instructor.name,
          avatar: instructor.avatar,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar instrutores:", error);
    }
  };

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

  const loadSubmodules = async () => {
    try {
      const { groups } = await listGroups(selectedModule);
      setSubmodules(groups.map((g) => ({ id: g.id, title: g.title })));
    } catch (error) {
      console.error("Erro ao carregar submódulos:", error);
    }
  };

  const loadLesson = async () => {
    try {
      setLoadingLesson(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      // A API busca por slug, então lessonId aqui é na verdade o slug
      const lesson = await getLessonBySlug(lessonId, token);
      if (!lesson) {
        toast.error("Aula não encontrada");
        return;
      }
      // Salvar o ID real da aula para usar no update
      setLessonRealId(lesson.id);
      setFormData({
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        slug: lesson.slug,
        url: lesson.url || "",
        isFree: lesson.isFree,
        video_url: lesson.video_url || "",
        video_duration: lesson.video_duration || "",
        locked: lesson.locked,
        order: lesson.order || 0,
        authorId: lesson.authorId || "",
        submoduleId: lesson.submoduleId,
      });

      // Carregar curso e módulo baseado no submodule da aula
      if (lesson.submodule?.module) {
        const courseId = lesson.submodule.module.courseId;
        const moduleId = lesson.submodule.moduleId;

        // Primeiro definir o curso
        setSelectedCourse(courseId);

        // Carregar módulos do curso e depois definir o módulo selecionado
        const loadModulesForCourse = async () => {
          try {
            const { modules } = await listModules(courseId);
            setModules(modules.map((m) => ({ id: m.id, title: m.title })));
            // Após carregar os módulos, definir o módulo selecionado
            setSelectedModule(moduleId);
          } catch (error) {
            console.error("Erro ao carregar módulos:", error);
          }
        };

        loadModulesForCourse();
      }

      // Marca o slug como editado manualmente para não sobrescrever ao carregar
      setSlugManuallyEdited(true);
    } catch (error) {
      console.error("Erro ao carregar aula:", error);
      toast.error("Erro ao carregar aula");
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      // Usar o ID real da aula para fazer o update
      if (!lessonRealId) {
        toast.error("ID da aula não encontrado");
        return;
      }
      await updateLesson(lessonRealId.toString(), formData, token);
      router.push("/lessons");
    } catch (error: any) {
      console.error("Erro ao atualizar aula:", error);
      toast.error(error.message || "Erro ao atualizar aula");
    } finally {
      setLoading(false);
    }
  };

  if (loadingLesson) {
    return (
      <MainLayout>
        <div className="text-center py-8">Carregando...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/lessons">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Editar Aula</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Atualize as informações da aula</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Aula</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => {
                        setFormData({ ...formData, slug: e.target.value });
                        setSlugManuallyEdited(true);
                      }}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newSlug = generateSlug(formData.title || "");
                        setFormData({ ...formData, slug: newSlug });
                        setSlugManuallyEdited(true);
                      }}
                    >
                      Gerar Slug
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="video">Vídeo</option>
                    <option value="text">Texto</option>
                    <option value="quiz">Quiz</option>
                    <option value="task">Tarefa</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url">URL do Vídeo</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) =>
                      setFormData({ ...formData, video_url: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_duration">Duração do Vídeo</Label>
                  <Input
                    id="video_duration"
                    value={formData.video_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, video_duration: e.target.value })
                    }
                    placeholder="00:00:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="authorId">Autor</Label>
                  <InstructorSelect
                    id="authorId"
                    instructors={instructors}
                    value={formData.authorId || ""}
                    onChange={(value) =>
                      setFormData({ ...formData, authorId: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Curso</Label>
                  <Select
                    id="course"
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setSelectedModule("");
                      setSubmodules([]);
                      setFormData({ ...formData, submoduleId: undefined });
                    }}
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
                  <Label htmlFor="module">Módulo</Label>
                  <Select
                    id="module"
                    value={selectedModule}
                    onChange={(e) => {
                      setSelectedModule(e.target.value);
                      setSubmodules([]);
                      setFormData({ ...formData, submoduleId: undefined });
                    }}
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
                  <Label htmlFor="submoduleId">Submódulo</Label>
                  <Select
                    id="submoduleId"
                    value={formData.submoduleId?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        submoduleId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    disabled={!selectedModule}
                  >
                    <option value="">Selecione um submódulo</option>
                    {submodules.map((submodule) => (
                      <option key={submodule.id} value={submodule.id}>
                        {submodule.title}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) =>
                      setFormData({ ...formData, isFree: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Aula Gratuita</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.locked}
                    onChange={(e) =>
                      setFormData({ ...formData, locked: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Bloqueada</span>
                </label>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/lessons">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

