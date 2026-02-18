"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getModuleBySlug, updateModule, type UpdateModuleData } from "@/actions/module";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingModule, setLoadingModule] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState<UpdateModuleData>({
    title: "",
    slug: "",
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
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoadingModule(true);
      const module = await getModuleBySlug(moduleId);
      if (!module) {
        toast.error("Módulo não encontrado");
        return;
      }
      setFormData({
        title: module.title,
        slug: module.slug,
      });
      // Marca o slug como editado manualmente para não sobrescrever ao carregar
      setSlugManuallyEdited(true);
    } catch (error) {
      console.error("Erro ao carregar módulo:", error);
      toast.error("Erro ao carregar módulo");
    } finally {
      setLoadingModule(false);
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
      await updateModule(moduleId, formData, token);
      router.push("/modules");
    } catch (error: any) {
      console.error("Erro ao atualizar módulo:", error);
      toast.error(error.message || "Erro ao atualizar módulo");
    } finally {
      setLoading(false);
    }
  };

  if (loadingModule) {
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
          <Link href="/modules">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Editar Módulo</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Atualize as informações do módulo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex justify-end gap-4">
                <Link href="/modules">
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

