"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  listCertificateTemplates,
  CertificateTemplate,
  deleteCertificateTemplate,
  createCertificateTemplate,
} from "@/actions/certificates/templates";
import { listAllCertificates, IssuedCertificate } from "@/actions/certificates/issued";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DEFAULT_TEMPLATE_ID = "clseed_default_certificate_template";

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState("issued");
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issued, setIssued] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [templatesData, issuedData] = await Promise.all([
        listCertificateTemplates(),
        listAllCertificates(1, 50),
      ]);

      setTemplates(templatesData.templates);
      setIssued(issuedData.certificates);
    } catch {
      toast.error("Erro ao carregar os dados de certificados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteTemplate = async (id: string) => {
    if (id === DEFAULT_TEMPLATE_ID) {
      toast.error("O template padrão da plataforma não pode ser removido.");
      return;
    }
    if (!confirm("Tem certeza que deseja apagar este template?")) return;
    try {
      await deleteCertificateTemplate(id);
      toast.success("Template apagado.");
      loadData();
    } catch {
      toast.error("Erro ao apagar template.");
    }
  };

  const handleCreateTemplate = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Informe o nome do template.");
      return;
    }
    setSavingTemplate(true);
    try {
      await createCertificateTemplate({
        name,
        description: newDescription.trim() || "—",
      });
      toast.success("Template criado.");
      setNewName("");
      setNewDescription("");
      setShowNewTemplate(false);
      loadData();
    } catch {
      toast.error("Erro ao criar template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Certificados</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              O template <strong>Code Legends — Conclusão (padrão)</strong> é criado pelo seed da API e usado
              automaticamente ao gerar certificados no aluno. Crie modelos adicionais aqui se precisar
              de variantes administrativas; o PDF continua com o layout da plataforma aluna.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="issued">Emitidos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="issued">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Emissões</CardTitle>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500 py-4 text-center">Carregando...</p>
                ) : issued.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <AlertCircle className="mb-2 h-8 w-8" />
                    <p>Nenhum certificado emitido até o momento.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Template Usado</TableHead>
                        <TableHead>Data de Emissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issued.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{cert.user.name}</span>
                              <span className="text-xs text-gray-500">{cert.user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cert.course.title}</TableCell>
                          <TableCell>{cert.template?.name ?? "Não especificado"}</TableCell>
                          <TableCell>{formatDate(cert.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Modelos de Certificados</CardTitle>
                <Button
                  size="sm"
                  type="button"
                  variant={showNewTemplate ? "secondary" : "default"}
                  onClick={() => setShowNewTemplate((v) => !v)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {showNewTemplate ? "Fechar" : "Novo Template"}
                </Button>
              </CardHeader>
              <CardContent>
                {showNewTemplate && (
                  <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div>
                      <Label htmlFor="tpl-name">Nome</Label>
                      <Input
                        id="tpl-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ex.: Parceria Empresa X"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tpl-desc">Descrição</Label>
                      <Textarea
                        id="tpl-desc"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Notas internas sobre o uso deste modelo"
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateTemplate}
                        disabled={savingTemplate}
                      >
                        {savingTemplate ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowNewTemplate(false);
                          setNewName("");
                          setNewDescription("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                {loading ? (
                  <p className="text-gray-500 py-4 text-center">Carregando...</p>
                ) : templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <AlertCircle className="mb-2 h-8 w-8" />
                    <p>Nenhum template cadastrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((tpl) => (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">{tpl.name}</TableCell>
                          <TableCell>{tpl.description}</TableCell>
                          <TableCell>{formatDate(tpl.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" disabled title="Edição em breve">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                disabled={tpl.id === DEFAULT_TEMPLATE_ID}
                                onClick={() => handleDeleteTemplate(tpl.id)}
                                title={
                                  tpl.id === DEFAULT_TEMPLATE_ID
                                    ? "Template padrão não pode ser removido"
                                    : "Remover"
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
