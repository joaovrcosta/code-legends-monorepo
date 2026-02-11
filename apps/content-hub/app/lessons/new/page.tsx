"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLesson, type CreateLessonData } from "@/actions/lesson";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId") || "";
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState<CreateLessonData>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      alert("ID do grupo é obrigatório");
      return;
    }
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }
      await createLesson(Number(groupId), formData, token);
      router.push("/lessons");
    } catch (error: any) {
      console.error("Erro ao criar aula:", error);
      alert(error.message || "Erro ao criar aula");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nova Aula</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Crie uma nova aula</p>
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
                <Button type="submit" disabled={loading || !groupId}>
                  {loading ? "Salvando..." : "Criar Aula"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

