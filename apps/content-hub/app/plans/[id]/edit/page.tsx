"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updatePlan,
  getPlanById,
  type UpdatePlanData,
} from "@/actions/plan";
import { getAuthTokenFromClient } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<UpdatePlanData>({
    slug: "",
    name: "",
    description: "",
    imageUrl: "",
    colorHex: "",
    amountCents: 0,
    order: 0,
    active: true,
    externalId: "",
    productName: "",
  });

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    try {
      setLoadingData(true);
      const token = getAuthTokenFromClient();
      const plan = await getPlanById(id, token ?? undefined);
      if (plan) {
        setFormData({
          slug: plan.slug,
          name: plan.name,
          description: plan.description ?? "",
          imageUrl: plan.imageUrl ?? "",
          colorHex: plan.colorHex ?? "",
          amountCents: plan.amountCents,
          order: plan.order,
          active: plan.active,
          externalId: plan.externalId ?? "",
          productName: plan.productName ?? "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
    } finally {
      setLoadingData(false);
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
      await updatePlan(
        id,
        {
          ...formData,
          slug: formData.slug?.toUpperCase(),
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          colorHex: formData.colorHex || null,
          externalId: formData.externalId || null,
          productName: formData.productName || null,
        },
        token
      );
      toast.success("Plano atualizado com sucesso");
      router.push("/plans");
    } catch (error: unknown) {
      console.error("Erro ao atualizar plano:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar plano"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
          <Link href="/plans">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Editar Plano
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Atualize as informações do plano
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Ex: PRO"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Code Legends PRO"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o plano..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Imagem do plano (URL)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="Ex: https://.../premium-plan.png"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Usada no frontend como ícone/imagem do plano.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorHex">Cor (Hex)</Label>
                <Input
                  id="colorHex"
                  value={formData.colorHex ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, colorHex: e.target.value })
                  }
                  placeholder="Ex: #8234E9"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Usada no frontend como cor do plano.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amountCents">Valor (centavos) *</Label>
                  <Input
                    id="amountCents"
                    type="number"
                    min={0}
                    value={formData.amountCents ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amountCents: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    value={formData.order ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="externalId">External ID (Abacate Pay)</Label>
                  <Input
                    id="externalId"
                    value={formData.externalId ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, externalId: e.target.value })
                    }
                    placeholder="Ex: CODE-LEGENDS-PRO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName">Nome do produto (checkout)</Label>
                  <Input
                    id="productName"
                    value={formData.productName ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    placeholder="Ex: Code Legends PRO - Assinatura anual"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Plano ativo
                </Label>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/plans">
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
