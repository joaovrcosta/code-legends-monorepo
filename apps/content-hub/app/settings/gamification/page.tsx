"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import {
  getGamificationSettings,
  updateGamificationSettings,
  GamificationSettings,
} from "@/actions/settings/gamification";
import { Save } from "lucide-react";

export default function GamificationSettingsPage() {
  const [settings, setSettings] = useState<GamificationSettings>({
    xpPerLesson: 15,
    xpPerProject: 50,
    xpQuizMultiplier: 1.5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGamificationSettings();
      setSettings(data.settings);
    } catch (error) {
      toast.error("Erro ao carregar as configurações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateGamificationSettings(settings);
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ch">Gamificação</h1>
          <p className="mt-2 text-ch-muted">
            Calibre as variáveis globais de pontuação de experiência (XP) concedida pelas atividades.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recompensas Base</CardTitle>
            <CardDescription>
              Ajuste o quanto os usuários ganham de experiência ao concluírem tarefas essenciais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-ch-muted py-4">Carregando...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="xpPerLesson">XP por Lição Concluída</Label>
                    <Input
                      id="xpPerLesson"
                      type="number"
                      min="0"
                      value={settings.xpPerLesson}
                      onChange={(e) =>
                        setSettings({ ...settings, xpPerLesson: parseInt(e.target.value) || 0 })
                      }
                    />
                    <p className="text-xs text-ch-muted">
                      Montante base de XP entregue na conclusão de qualquer módulo padrão (texto/vídeo).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="xpPerProject">XP por Projeto Aprovado</Label>
                    <Input
                      id="xpPerProject"
                      type="number"
                      min="0"
                      value={settings.xpPerProject}
                      onChange={(e) =>
                        setSettings({ ...settings, xpPerProject: parseInt(e.target.value) || 0 })
                      }
                    />
                    <p className="text-xs text-ch-muted">
                      Experiência massiva entregue quando um avaliador aprova o submissão do aluno.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="xpQuizMultiplier">Multiplicador de Quizzes</Label>
                    <Input
                      id="xpQuizMultiplier"
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.xpQuizMultiplier}
                      onChange={(e) =>
                        setSettings({ ...settings, xpQuizMultiplier: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-xs text-ch-muted">
                      Porcentagem do "XP por Lição" concedido em quizzes perfeitos. (Ex: 1.5 = +50%)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
