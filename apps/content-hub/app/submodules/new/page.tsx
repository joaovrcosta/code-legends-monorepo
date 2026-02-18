"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGroup, type CreateGroupData } from "@/actions/group";
import { getAuthTokenFromClient } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewSubmodulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId") || "";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGroupData>({
    title: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) {
      toast.error("ID do módulo é obrigatório");
      return;
    }
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      await createGroup(moduleId, formData, token);
      router.push("/submodules");
    } catch (error: any) {
      console.error("Erro ao criar submódulo:", error);
      toast.error(error.message || "Erro ao criar submódulo");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Novo Submódulo</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Crie um novo submódulo (grupo)</p>
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
                <Button type="submit" disabled={loading || !moduleId}>
                  {loading ? "Salvando..." : "Criar Submódulo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

