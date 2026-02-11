"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { InstructorSelect } from "@/components/ui/instructor-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCourse, listCourses, type CreateCourseData } from "@/actions/course";
import { listCategories } from "@/actions/category";
import { listInstructors } from "@/actions/user";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string; avatar?: string | null }>>([]);
  const [formData, setFormData] = useState<CreateCourseData>({
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

  // Gera slug automaticamente quando o título mudar
  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, slugManuallyEdited]);

  useEffect(() => {
    loadCategories();
    loadInstructors();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }
      await createCourse(formData, token);
      router.push("/courses");
    } catch (error: any) {
      console.error("Erro ao criar curso:", error);
      alert(error.message || "Erro ao criar curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Novo Curso</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Crie um novo curso para a plataforma</p>
          </div>
        </div>

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
                    value={formData.instructorId}
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
                  {loading ? "Salvando..." : "Criar Curso"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

