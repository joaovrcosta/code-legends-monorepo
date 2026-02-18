"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { InstructorSelect } from "@/components/ui/instructor-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCourseById,
  updateCourse,
  type UpdateCourseData,
  getCourseWithStructure,
  publishCourse,
  unpublishCourse,
  type ModuleWithStructure,
} from "@/actions/course";
import { listCategories } from "@/actions/category";
import { listInstructors } from "@/actions/user";
import { listTags } from "@/actions/tag/list-tags";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CourseBuilder } from "@/components/course-builder/course-builder";
import { toast } from "sonner";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string; avatar?: string | null }>>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [courseStatus, setCourseStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [modules, setModules] = useState<ModuleWithStructure[]>([]);
  const [formData, setFormData] = useState<UpdateCourseData>({
    title: "",
    slug: "",
    description: "",
    level: "INICIANTE",
    instructorId: "",
    categoryId: "",
    thumbnail: "",
    icon: "",
    colorHex: "",
    tags: [],
    isFree: false,
    active: true,
  });

  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title || ""),
      }));
    }
  }, [formData.title, slugManuallyEdited]);

  useEffect(() => {
    loadCategories();
    loadInstructors();
    loadCourse();
    loadCourseStructure();
  }, [courseId]);

  useEffect(() => {
    const searchTags = async () => {
      if (tagInput.trim().length > 0) {
        const { tags } = await listTags(tagInput.trim());
        const availableTags = tags.filter(
          (tag) => !formData.tags?.includes(tag.name)
        );
        setTagSuggestions(availableTags);
        setShowSuggestions(availableTags.length > 0);
      } else {
        setTagSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchTags, 300);
    return () => clearTimeout(timeoutId);
  }, [tagInput, formData.tags]);

  const loadCategories = async () => {
    try {
      const { categories } = await listCategories();
      setCategories(categories.map((cat) => ({ id: cat.id, name: cat.name })));
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

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

  const loadCourse = async () => {
    try {
      setLoadingCourse(true);
      const course = await getCourseById(courseId);
      if (!course) {
        toast.error("Curso não encontrado");
        return;
      }
      setFormData({
        title: course.title,
        slug: course.slug,
        description: course.description,
        level: course.level,
        instructorId: course.instructorId || "",
        categoryId: course.categoryId || "",
        thumbnail: course.thumbnail || "",
        icon: course.icon || "",
        colorHex: course.colorHex || "",
        tags: course.tags || [],
        isFree: course.isFree,
        active: course.active,
      });
      setCourseStatus(course.status || "DRAFT");
      setSlugManuallyEdited(true);
    } catch (error) {
      console.error("Erro ao carregar curso:", error);
      toast.error("Erro ao carregar curso");
    } finally {
      setLoadingCourse(false);
    }
  };

  const loadCourseStructure = async () => {
    try {
      setLoadingStructure(true);
      const structure = await getCourseWithStructure(courseId);
      if (structure) {
        setModules(structure.modules);
      }
    } catch (error) {
      console.error("Erro ao carregar estrutura do curso:", error);
    } finally {
      setLoadingStructure(false);
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
      await updateCourse(courseId, formData, token);
      // Não redireciona, apenas mostra sucesso
      toast.success("Curso atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar curso:", error);
      toast.error(error.message || "Erro ao atualizar curso");
    } finally {
      setLoading(false);
    }
  };

  const validateCourseForPublishing = (): string[] => {
    const errors: string[] = [];

    if (!formData.title || formData.title.trim().length === 0) {
      errors.push("O curso deve possuir um título");
    }

    if (!formData.description || formData.description.trim().length === 0) {
      errors.push("O curso deve possuir uma descrição");
    }

    if (!formData.instructorId) {
      errors.push("O curso deve possuir um instrutor");
    }

    if (modules.length === 0) {
      errors.push("O curso deve possuir ao menos um módulo");
    }

    const totalLessons = modules.reduce(
      (total, module) =>
        total +
        module.groups.reduce(
          (groupTotal, group) => groupTotal + group.lessons.length,
          0
        ),
      0
    );

    if (totalLessons === 0) {
      errors.push("O curso deve possuir ao menos uma aula");
    }

    return errors;
  };

  const handlePublish = async () => {
    const errors = validateCourseForPublishing();
    if (errors.length > 0) {
      toast.error(`Não é possível publicar o curso:\n${errors.join("\n")}`);
      return;
    }

    if (!confirm("Tem certeza que deseja publicar este curso?")) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }

      const response = await publishCourse(courseId, token);
      setCourseStatus(response.course.status);
      toast.success("Curso publicado com sucesso!");
      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      setTimeout(() => {
        loadCourse();
      }, 500);
    } catch (error: any) {
      console.error("Erro ao publicar curso:", error);
      toast.error(error.message || "Erro ao publicar curso");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Tem certeza que deseja despublicar este curso?")) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }

      const response = await unpublishCourse(courseId, token);
      setCourseStatus(response.course.status);
      toast.success("Curso despublicado com sucesso!");
      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      setTimeout(() => {
        loadCourse();
      }, 500);
    } catch (error: any) {
      console.error("Erro ao despublicar curso:", error);
      toast.error(error.message || "Erro ao despublicar curso");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCourse) {
    return (
      <MainLayout>
        <div className="text-center py-8">Carregando...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formData.title || "Editar Curso"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    courseStatus === "PUBLISHED"
                      ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-yellow-900/20 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      courseStatus === "PUBLISHED"
                        ? "bg-emerald-700 dark:bg-emerald-400"
                        : "bg-yellow-700 dark:bg-yellow-400"
                    }`}
                  />
                  {courseStatus === "PUBLISHED" ? "Publicado" : "Rascunho"}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Atualize as informações e estrutura do curso
              </p>
            </div>
          </div>
        </div>

        {/* Seção 1: Dados do Curso */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Curso</CardTitle>
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
                  <Label htmlFor="level">Nível *</Label>
                  <Select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  >
                    <option value="INICIANTE">Iniciante</option>
                    <option value="INTERMEDIARIO">Intermediário</option>
                    <option value="AVANCADO">Avançado</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instrutor *</Label>
                  <InstructorSelect
                    id="instructorId"
                    instructors={instructors}
                    value={formData.instructorId || ""}
                    onChange={(value) =>
                      setFormData({ ...formData, instructorId: value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Ícone URL</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorHex">Cor (Hex)</Label>
                  <Input
                    id="colorHex"
                    value={formData.colorHex}
                    onChange={(e) =>
                      setFormData({ ...formData, colorHex: e.target.value })
                    }
                    placeholder="#000000"
                  />
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

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-2 relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        id="tagInput"
                        placeholder="Digite uma tag e pressione Enter"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          if (tagSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const tagValue = tagInput.trim();
                            if (tagValue && !formData.tags?.includes(tagValue)) {
                              setFormData({
                                ...formData,
                                tags: [...(formData.tags || []), tagValue],
                              });
                              setTagInput("");
                              setShowSuggestions(false);
                            }
                          } else if (e.key === "Escape") {
                            setShowSuggestions(false);
                          }
                        }}
                      />
                      {showSuggestions && tagSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                          {tagSuggestions.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                              onClick={() => {
                                if (!formData.tags?.includes(tag.name)) {
                                  setFormData({
                                    ...formData,
                                    tags: [...(formData.tags || []), tag.name],
                                  });
                                }
                                setTagInput("");
                                setShowSuggestions(false);
                              }}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                tags: formData.tags?.filter((_, i) => i !== index) || [],
                              });
                            }}
                            className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pressione Enter para adicionar uma tag
                  </p>
                </div>
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
                  <span>Curso Gratuito</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Ativo</span>
                </label>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/courses">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                {courseStatus === "DRAFT" ? (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Publicar Curso
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={loading}
                    variant="outline"
                    className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Despublicar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Seção 2: Estrutura do Curso */}
        <Card>
          <CardHeader>
            <CardTitle>Estrutura do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStructure ? (
              <div className="text-center py-8">Carregando estrutura...</div>
            ) : (
              <CourseBuilder
                courseId={courseId}
                modules={modules}
                onModulesChange={(updatedModules) => {
                  setModules(updatedModules);
                }}
                onReloadStructure={() => {
                  loadCourseStructure();
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
