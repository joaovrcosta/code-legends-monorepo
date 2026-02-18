"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGroupById, updateGroup, type UpdateGroupData } from "@/actions/group";
import { getAuthTokenFromClient } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditSubmodulePage() {
  const router = useRouter();
  const params = useParams();
  const groupId = Number(params.id);
  const [loading, setLoading] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [formData, setFormData] = useState<UpdateGroupData>({
    title: "",
  });

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoadingGroup(true);
      const group = await getGroupById(groupId);
      if (!group) {
        toast.error("Submódulo não encontrado");
        return;
      }
      setFormData({
        title: group.title,
      });
    } catch (error) {
      console.error("Erro ao carregar submódulo:", error);
      toast.error("Erro ao carregar submódulo");
    } finally {
      setLoadingGroup(false);
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
      await updateGroup(groupId, formData, token);
      router.push("/submodules");
    } catch (error: any) {
      console.error("Erro ao atualizar submódulo:", error);
      toast.error(error.message || "Erro ao atualizar submódulo");
    } finally {
      setLoading(false);
    }
  };

  if (loadingGroup) {
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
          <Link href="/submodules">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Editar Submódulo</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Atualize as informações do submódulo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Submódulo</CardTitle>
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

              <div className="flex justify-end gap-4">
                <Link href="/submodules">
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

