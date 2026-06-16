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
  type LessonFreeSync,
  getCourseWithStructure,
  publishCourse,
  unpublishCourse,
  type ModuleWithStructure,
} from "@/actions/course";
import { getLessonProductionByCourse } from "@/actions/lesson/get-lesson-production-by-course";
import { listCategories } from "@/actions/category";
import { listInstructors } from "@/actions/user";
import { listTags } from "@/actions/tag/list-tags";
import { listSkills } from "@/actions/skill/list-skills";
import {
  getCourseSkillsConfig,
  updateCourseSkillsConfig,
  type CourseSkillsConfigResponse,
} from "@/actions/skill/get-course-skills";
import { getAuthTokenFromClient } from "@/lib/auth";
import { parseSkillWeightInput } from "@/lib/parse-skill-weight";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { mergeProductionIntoModules } from "@/lib/course-structure";
import { CourseBuilder } from "@/components/course-builder/course-builder";
import { CourseProductionKanban } from "@/components/course-builder/course-production-kanban";
import { toast } from "sonner";
import { verifyPassword } from "@/actions/user/verify-password";
import { X } from "lucide-react";

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
  const [structureView, setStructureView] = useState<"tree" | "kanban">("tree");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishPassword, setPublishPassword] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [availableSkills, setAvailableSkills] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [courseSkills, setCourseSkills] = useState<
    Array<{ skillId: string; name: string; slug: string; weight: number }>
  >([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [initialIsFree, setInitialIsFree] = useState(false);
  const [showLessonFreeSyncModal, setShowLessonFreeSyncModal] = useState(false);
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
    loadCourse();
    loadCourseStructure();
    loadCourseSkills();
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

  const loadSkills = async () => {
    try {
      const { skills } = await listSkills();
      setAvailableSkills(
        skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          slug: skill.slug,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
    }
  };

  const loadCourseSkills = async () => {
    try {
      const token = getAuthTokenFromClient();
      if (!token) {
        return;
      }
      const config: CourseSkillsConfigResponse | null = await getCourseSkillsConfig(
        courseId,
        token
      );
      if (config && Array.isArray(config.skills)) {
        setCourseSkills(
          config.skills.map((item) => ({
            skillId: item.skillId,
            name: item.name,
            slug: item.slug,
            weight: item.weight,
          }))
        );
      } else {
        setCourseSkills([]);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração de skills do curso:", error);
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
      setInitialIsFree(course.isFree);
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
      const token = getAuthTokenFromClient();
      const [structure, production] = await Promise.all([
        getCourseWithStructure(courseId, { includeContent: false, token: token ?? undefined }),
        token ? getLessonProductionByCourse(courseId, token) : Promise.resolve({ items: [] }),
      ]);
      if (!structure) return;

      setModules(
        mergeProductionIntoModules(structure.modules, production.items),
      );
    } catch (error) {
      console.error("Erro ao carregar estrutura do curso:", error);
    } finally {
      setLoadingStructure(false);
      void loadCategories();
      void loadInstructors();
      void loadSkills();
    }
  };

  const persistCourse = async (lessonFreeSync?: LessonFreeSync) => {
    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    const skillFromSelect =
      selectedSkillId &&
      !courseSkills.some((cs) => cs.skillId === selectedSkillId)
        ? availableSkills.find((s) => s.id === selectedSkillId)
        : null;

    const skillsToPersist = [
      ...courseSkills,
      ...(skillFromSelect
        ? [
            {
              skillId: skillFromSelect.id,
              name: skillFromSelect.name,
              slug: skillFromSelect.slug,
              weight: 100,
            },
          ]
        : []),
    ];

    let sync: LessonFreeSync | undefined = lessonFreeSync;
    if (sync === undefined) {
      if (!initialIsFree && formData.isFree) {
        sync = "all_free";
      }
    }

    const { lessonsSynced } = await updateCourse(
      courseId,
      { ...formData, lessonFreeSync: sync },
      token,
    );

    const updatedConfig = await updateCourseSkillsConfig(
      courseId,
      skillsToPersist.map((item) => ({
        skillId: item.skillId,
        weight: item.weight,
      })),
      token,
    );
    if (!updatedConfig) {
      throw new Error("Erro ao atualizar skills do curso");
    }

    if (skillFromSelect) {
      setCourseSkills(skillsToPersist);
      setSelectedSkillId("");
    }

    setInitialIsFree(formData.isFree ?? false);

    if (
      (lessonFreeSync === "all_paid" || lessonFreeSync === "all_free") &&
      (lessonsSynced ?? 0) > 0
    ) {
      await loadCourseStructure();
    }

    const successMessage =
      lessonFreeSync === "all_paid" && (lessonsSynced ?? 0) > 0
        ? `Curso atualizado. ${lessonsSynced} aula(s) marcada(s) como pagas.`
        : lessonFreeSync === "all_free" && (lessonsSynced ?? 0) > 0
          ? `Curso atualizado. ${lessonsSynced} aula(s) marcada(s) como gratuitas.`
          : "Curso atualizado com sucesso!";
    toast.success(successMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (initialIsFree && !formData.isFree) {
      setShowLessonFreeSyncModal(true);
      return;
    }

    try {
      setLoading(true);
      await persistCourse();
    } catch (error: unknown) {
      console.error("Erro ao atualizar curso:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar curso",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLessonFreeSyncChoice = async (choice: LessonFreeSync) => {
    setShowLessonFreeSyncModal(false);
    try {
      setLoading(true);
      await persistCourse(choice);
    } catch (error: unknown) {
      console.error("Erro ao atualizar curso:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar curso",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkillToCourse = () => {
    if (!selectedSkillId) return;
    const skill = availableSkills.find((s) => s.id === selectedSkillId);
    if (!skill) return;

    const alreadyAdded = courseSkills.some(
      (cs) => cs.skillId === selectedSkillId
    );
    if (alreadyAdded) {
      setSelectedSkillId("");
      return;
    }

    setCourseSkills((prev) => [
      ...prev,
      {
        skillId: skill.id,
        name: skill.name,
        slug: skill.slug,
        weight: 100,
      },
    ]);
    setSelectedSkillId("");
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

  const handlePublishClick = () => {
    const errors = validateCourseForPublishing();
    if (errors.length > 0) {
      toast.error(`Não é possível publicar o curso:\n${errors.join("\n")}`);
      return;
    }

    setShowPublishModal(true);
    setPublishPassword("");
    setPasswordError("");
  };

  const handlePublishConfirm = async () => {
    if (!publishPassword.trim()) {
      setPasswordError("Senha é obrigatória");
      return;
    }

    setVerifyingPassword(true);
    setPasswordError("");

    try {
      const result = await verifyPassword(publishPassword);

      if (!result.success) {
        setPasswordError(result.message);
        setVerifyingPassword(false);
        return;
      }

      setShowPublishModal(false);
      setPublishPassword("");
      setPasswordError("");

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
        setTimeout(() => {
          loadCourse();
        }, 500);
      } catch (error: any) {
        console.error("Erro ao publicar curso:", error);
        toast.error(error.message || "Erro ao publicar curso");
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Erro ao verificar senha:", error);
      setPasswordError("Erro ao verificar senha. Tente novamente.");
    } finally {
      setVerifyingPassword(false);
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${courseStatus === "PUBLISHED"
                    ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-yellow-900/20 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${courseStatus === "PUBLISHED"
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

              <div className="space-y-2">
                <Label>Skills deste curso</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  As skills definem para onde o XP deste curso será distribuído
                  (por exemplo, JavaScript, Web development, IA).
                </p>
                <div className="flex gap-2">
                  <Select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                  >
                    <option value="">Selecione uma skill</option>
                    {availableSkills
                      .filter(
                        (skill) =>
                          !courseSkills.some(
                            (cs) => cs.skillId === skill.id
                          )
                      )
                      .map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name} ({skill.slug})
                        </option>
                      ))}
                  </Select>
                  <Button type="button" variant="outline" onClick={handleAddSkillToCourse}>
                    Adicionar
                  </Button>
                </div>

                {courseSkills.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {courseSkills.map((item) => (
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
                              );
                              setCourseSkills((prev) =>
                                prev.map((cs) =>
                                  cs.skillId === item.skillId
                                    ? { ...cs, weight: value }
                                    : cs
                                )
                              );
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
                              setCourseSkills((prev) =>
                                prev.filter(
                                  (cs) => cs.skillId !== item.skillId
                                )
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
                    onClick={handlePublishClick}
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
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Estrutura do Curso</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={structureView === "tree" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStructureView("tree")}
                >
                  Árvore
                </Button>
                <Button
                  type="button"
                  variant={structureView === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStructureView("kanban")}
                >
                  Kanban
                </Button>
              </div>
            </div>
          </CardHeader>
            <CardContent>
              {loadingStructure ? (
                <div className="text-center py-8">Carregando estrutura...</div>
              ) : (
                <>
                  {structureView === "tree" ? (
                    <CourseBuilder
                      courseId={courseId}
                      courseTitle={formData.title || ""}
                      modules={modules}
                      courseSkillIds={courseSkills.map((s) => s.skillId)}
                      onModulesChange={(updatedModules) => {
                        setModules(updatedModules);
                      }}
                      onReloadStructure={() => {
                        loadCourseStructure();
                      }}
                    />
                  ) : (
                    <CourseProductionKanban
                      courseId={courseId}
                      courseTitle={formData.title || ""}
                      modules={modules}
                      onModulesChange={setModules}
                    />
                  )}
                </>
              )}
            </CardContent>
        </Card>

        {showPublishModal && (
          <div className="cb-modal-overlay p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Confirmar Publicação</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowPublishModal(false);
                    setPublishPassword("");
                    setPasswordError("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tem certeza que deseja publicar este curso? Para confirmar, digite sua senha:
                </p>

                <div className="space-y-2">
                  <Label htmlFor="publish-password">Senha</Label>
                  <Input
                    id="publish-password"
                    type="password"
                    value={publishPassword}
                    onChange={(e) => {
                      setPublishPassword(e.target.value);
                      setPasswordError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !verifyingPassword) {
                        handlePublishConfirm();
                      }
                    }}
                    placeholder="Digite sua senha"
                    disabled={verifyingPassword}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPublishModal(false);
                      setPublishPassword("");
                      setPasswordError("");
                    }}
                    disabled={verifyingPassword}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handlePublishConfirm}
                    disabled={verifyingPassword || !publishPassword.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {verifyingPassword ? "Verificando..." : "Confirmar Publicação"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showLessonFreeSyncModal && (
          <div className="cb-modal-overlay">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Curso deixou de ser gratuito</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLessonFreeSyncModal(false)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  O curso não está mais marcado como gratuito. O que fazer com
                  as aulas que ainda estão como gratuitas?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowLessonFreeSyncModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLessonFreeSyncChoice("keep")}
                    disabled={loading}
                  >
                    Manter aulas gratuitas
                  </Button>
                  <Button
                    onClick={() => handleLessonFreeSyncChoice("all_paid")}
                    disabled={loading}
                  >
                    Marcar todas como pagas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
