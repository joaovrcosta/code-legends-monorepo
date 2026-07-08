"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPlan, type CreatePlanData } from "@/actions/plan";
import { PlanFeatureCheckboxes } from "@/components/plans/plan-feature-checkboxes";
import { PlanPriceInput } from "@/components/plans/plan-price-input";
import type { PlanFeature } from "@code-legends/plans";
import { PlanBadgePreview } from "@/components/plans/plan-badge-preview";
import { getAuthTokenFromClient } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlanData>({
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
    features: [] as PlanFeature[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      await createPlan(
        {
          ...formData,
          slug: formData.slug.toUpperCase(),
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          colorHex: formData.colorHex || null,
          externalId: formData.externalId || null,
          productName: formData.productName || null,
        },
        token
      );
      toast.success("Plano criado com sucesso");
      router.push("/plans");
    } catch (error: unknown) {
      console.error("Erro ao criar plano:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar plano"
      );
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-ch">
              Novo Plano
            </h1>
            <p className="text-ch-muted mt-2">
              Cadastre um novo plano de assinatura
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
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Ex: PRO, PREMIUM"
                    required
                  />
                  <p className="text-xs text-muted">
                    Identificador único (ex: FREE, PRO, PREMIUM). Será salvo em
                    maiúsculas.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
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
                  value={formData.description || ""}
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
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="Ex: https://.../pro-plan.png"
                />
                <p className="text-xs text-muted">
                  Opcional. Usada no frontend como ícone/imagem do plano.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorHex">Cor (Hex)</Label>
                <Input
                  id="colorHex"
                  value={formData.colorHex || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, colorHex: e.target.value })
                  }
                  placeholder="Ex: #8234E9"
                />
                <p className="text-xs text-muted">
                  Opcional. Usada no frontend como cor do plano.
                </p>
              </div>

              <PlanBadgePreview
                name={formData.name}
                colorHex={formData.colorHex}
                imageUrl={formData.imageUrl}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="planPrice">Valor *</Label>
                  <PlanPriceInput
                    id="planPrice"
                    valueCents={formData.amountCents ?? 0}
                    onChange={(amountCents) =>
                      setFormData({ ...formData, amountCents })
                    }
                    required
                  />
                  <p className="text-xs text-muted">
                    Valor anual em reais. Use 0 para plano gratuito.
                  </p>
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
                    value={formData.externalId || ""}
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
                    value={formData.productName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    placeholder="Ex: Code Legends PRO - Assinatura anual"
                  />
                </div>
              </div>

              <PlanFeatureCheckboxes
                value={formData.features ?? []}
                onChange={(features) =>
                  setFormData({ ...formData, features })
                }
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded border-ch-border"
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
                  {loading ? "Criando..." : "Criar Plano"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
