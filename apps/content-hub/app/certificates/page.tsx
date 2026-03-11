"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, DownloadCloud, AlertCircle } from "lucide-react";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";
import {
  listCertificateTemplates,
  CertificateTemplate,
  deleteCertificateTemplate,
} from "@/actions/certificates/templates";
import { listAllCertificates, IssuedCertificate } from "@/actions/certificates/issued";

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState("issued");
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issued, setIssued] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) return;

      const [templatesData, issuedData] = await Promise.all([
        listCertificateTemplates(token),
        listAllCertificates(token, 1, 50),
      ]);

      setTemplates(templatesData.templates);
      setIssued(issuedData.certificates);
    } catch (error) {
      toast.error("Erro ao carregar os dados de certificados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este template?")) return;
    try {
      const token = getAuthTokenFromClient();
      if (!token) return;
      await deleteCertificateTemplate(token, id);
      toast.success("Template apagado.");
      loadData();
    } catch {
      toast.error("Erro ao apagar template.");
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
              Gerencie modelos de certificados e visualize os certificados já emitidos na plataforma.
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
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Template
                </Button>
              </CardHeader>
              <CardContent>
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
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => handleDeleteTemplate(tpl.id)}
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
