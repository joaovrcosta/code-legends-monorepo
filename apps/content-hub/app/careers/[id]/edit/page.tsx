"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import {
  adminCreateCareerExam,
  adminCreateCareerModule,
  adminListCareers,
  adminSetCareerModuleCourses,
  adminSetCareerModuleExams,
  adminUpdateCareer,
  adminUpdateCareerExam,
  adminUpdateCareerModule,
  adminDeleteCareerModule,
  adminDeleteCareerExam,
  type Career,
  type CareerExam,
  type CareerModule,
} from "@/actions/career";
import { listCourses, type Course } from "@/actions/course";

function safeJsonParse(text: string): { ok: true; value: any } | { ok: false; error: string } {
  try {
    const v = text.trim() ? JSON.parse(text) : null;
    return { ok: true, value: v };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "JSON inválido";
    return { ok: false, error: msg };
  }
}

export default function EditCareerPage() {
  const params = useParams();
  const careerId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [career, setCareer] = useState<Career | null>(null);
  const [modules, setModules] = useState<CareerModule[]>([]);
  const [exams, setExams] = useState<CareerExam[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    colorHex: "",
    active: true,
  });

  const load = useCallback(async () => {
    try {
      setLoadingData(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      const [{ careers }, { courses }] = await Promise.all([
        adminListCareers(token),
        listCourses({ token }),
      ]);
      const found = careers.find((c) => c.id === careerId);
      if (!found) {
        toast.error("Carreira não encontrada");
        return;
      }
      setCareer(found);
      setModules(found.modules ?? []);
      setExams(found.exams ?? []);
      setAllCourses(courses ?? []);
      setForm({
        title: found.title,
        slug: found.slug,
        description: found.description ?? "",
        thumbnail: found.thumbnail ?? "",
        colorHex: found.colorHex ?? "",
        active: found.active,
      });
      setSlugManuallyEdited(true);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar carreira");
    } finally {
      setLoadingData(false);
    }
  }, [careerId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (form.title && !slugManuallyEdited) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.title || "") }));
    }
  }, [form.title, slugManuallyEdited]);

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
    [modules]
  );

  const handleSaveCareer = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) return;
      const { career } = await adminUpdateCareer(
        careerId,
        {
          title: form.title,
          slug: form.slug,
          description: form.description || null,
          thumbnail: form.thumbnail || null,
          colorHex: form.colorHex || null,
          active: form.active,
        },
        token
      );
      toast.success("Carreira atualizada!");
      setCareer((prev) => (prev ? { ...prev, ...career } : career));
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao salvar carreira");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) return;
      const { module } = await adminCreateCareerModule(
        careerId,
        { title: `Módulo ${modules.length + 1}`, orderIndex: modules.length },
        token
      );
      toast.success("Módulo criado!");
      setModules((prev) => [...prev, module]);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao criar módulo");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) return;
      const { exam } = await adminCreateCareerExam(
        careerId,
        { title: `Exame ${exams.length + 1}`, slug: `exam-${exams.length + 1}` },
        token
      );
      toast.success("Exame criado!");
      setExams((prev) => [...prev, exam]);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao criar exame");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <MainLayout>
        <div className="py-12 text-center text-gray-500">Carregando...</div>
      </MainLayout>
    );
  }

  if (!career) {
    return (
      <MainLayout>
        <div className="py-12 text-center text-gray-500">Carreira não encontrada.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/careers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {career.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Edite módulos, cursos e exames.
              </p>
            </div>
          </div>

          <Button onClick={handleSaveCareer} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar carreira"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => {
                      setForm({ ...form, slug: e.target.value });
                      setSlugManuallyEdited(true);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm({ ...form, slug: generateSlug(form.title || "") });
                      setSlugManuallyEdited(true);
                    }}
                  >
                    Gerar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorHex">Cor (Hex)</Label>
                <Input
                  id="colorHex"
                  value={form.colorHex}
                  onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                  placeholder="#00C8FF"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded"
                id="active"
              />
              <Label htmlFor="active">Ativa</Label>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Módulos</CardTitle>
              <Button onClick={handleAddModule} disabled={loading} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedModules.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhum módulo ainda.</div>
              ) : (
                sortedModules.map((m) => (
                  <CareerModuleCard
                    key={m.id}
                    careerId={careerId}
                    module={m}
                    allCourses={allCourses}
                    exams={exams}
                    onUpdated={(next) => {
                      setModules((prev) => prev.map((x) => (x.id === next.id ? next : x)));
                    }}
                    onDeleted={async () => {
                      setModules((prev) => prev.filter((x) => x.id !== m.id));
                    }}
                    onSetCourses={async (courses) => {
                      const token = getAuthTokenFromClient();
                      await adminSetCareerModuleCourses(m.id, courses, token || undefined);
                      toast.success("Cursos vinculados!");
                    }}
                    onSetExams={async (examsToSet) => {
                      const token = getAuthTokenFromClient();
                      await adminSetCareerModuleExams(m.id, examsToSet, token || undefined);
                      toast.success("Exames vinculados!");
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Exames</CardTitle>
              <Button onClick={handleAddExam} disabled={loading} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {exams.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhum exame ainda.</div>
              ) : (
                exams.map((e) => (
                  <CareerExamCard
                    key={e.id}
                    careerId={careerId}
                    exam={e}
                    onUpdated={(next) =>
                      setExams((prev) => prev.map((x) => (x.id === next.id ? next : x)))
                    }
                    onDeleted={() =>
                      setExams((prev) => prev.filter((x) => x.id !== e.id))
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

function CareerModuleCard({
  careerId,
  module,
  allCourses,
  exams,
  onUpdated,
  onDeleted,
  onSetCourses,
  onSetExams,
}: {
  careerId: string;
  module: CareerModule;
  allCourses: Course[];
  exams: CareerExam[];
  onUpdated: (m: CareerModule) => void;
  onDeleted: () => void;
  onSetCourses: (courses: Array<{ courseId: string; orderIndex?: number }>) => Promise<void>;
  onSetExams: (exams: Array<{ careerExamId: string; examIndex: 1 | 2 }>) => Promise<void>;
}) {
  const [local, setLocal] = useState({
    title: module.title,
    description: module.description ?? "",
    orderIndex: module.orderIndex ?? 0,
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [exam1, setExam1] = useState<string>("");
  const [exam2, setExam2] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    try {
      setBusy(true);
      const token = getAuthTokenFromClient();
      const { module: updated } = await adminUpdateCareerModule(
        careerId,
        module.id,
        {
          title: local.title,
          description: local.description || null,
          orderIndex: Number(local.orderIndex) || 0,
        },
        token || undefined
      );
      toast.success("Módulo salvo!");
      onUpdated(updated);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao salvar módulo");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Excluir este módulo?")) return;
    try {
      setBusy(true);
      const token = getAuthTokenFromClient();
      await adminDeleteCareerModule(careerId, module.id, token || undefined);
      toast.success("Módulo excluído!");
      onDeleted();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao excluir módulo");
    } finally {
      setBusy(false);
    }
  };

  const applyCourses = async () => {
    try {
      setBusy(true);
      await onSetCourses(selectedCourses.map((id, idx) => ({ courseId: id, orderIndex: idx })));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao vincular cursos");
    } finally {
      setBusy(false);
    }
  };

  const applyExams = async () => {
    try {
      setBusy(true);
      const payload: Array<{ careerExamId: string; examIndex: 1 | 2 }> = [];
      if (exam1) payload.push({ careerExamId: exam1, examIndex: 1 });
      if (exam2) payload.push({ careerExamId: exam2, examIndex: 2 });
      await onSetExams(payload);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao vincular exames");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label>Título</Label>
          <Input value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Ordem</Label>
          <Input
            type="number"
            value={local.orderIndex}
            onChange={(e) => setLocal({ ...local, orderIndex: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={local.description} onChange={(e) => setLocal({ ...local, description: e.target.value })} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={busy} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar módulo
        </Button>
        <Button onClick={remove} disabled={busy} variant="outline" className="gap-2">
          <Trash2 className="h-4 w-4 text-red-600" />
          Excluir
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cursos vinculados</Label>
          <Select
            multiple
            value={selectedCourses}
            onChange={(e) => {
              const opts = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
              setSelectedCourses(opts);
            }}
            className="h-40"
          >
            {allCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Button onClick={applyCourses} disabled={busy} variant="outline">
            Aplicar cursos
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Exames do módulo</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Exame 1</Label>
              <Select value={exam1} onChange={(e) => setExam1(e.target.value)}>
                <option value="">—</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Exame 2</Label>
              <Select value={exam2} onChange={(e) => setExam2(e.target.value)}>
                <option value="">—</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button onClick={applyExams} disabled={busy} variant="outline">
            Aplicar exames
          </Button>
        </div>
      </div>
    </div>
  );
}

function CareerExamCard({
  careerId,
  exam,
  onUpdated,
  onDeleted,
}: {
  careerId: string;
  exam: CareerExam;
  onUpdated: (e: CareerExam) => void;
  onDeleted: () => void;
}) {
  const [local, setLocal] = useState({
    title: exam.title,
    slug: exam.slug,
    description: exam.description ?? "",
    passingScore: exam.passingScore ?? 70,
    maxAttempts: exam.maxAttempts ?? null,
    contentText: JSON.stringify(exam.content ?? { challenges: [] }, null, 2),
  });
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => safeJsonParse(local.contentText), [local.contentText]);

  const save = async () => {
    if (!parsed.ok) {
      toast.error(`JSON inválido: ${parsed.error}`);
      return;
    }
    try {
      setBusy(true);
      const token = getAuthTokenFromClient();
      const { exam: updated } = await adminUpdateCareerExam(
        careerId,
        exam.id,
        {
          title: local.title,
          slug: local.slug,
          description: local.description || null,
          passingScore: Number(local.passingScore) || 70,
          maxAttempts: local.maxAttempts === null ? null : Number(local.maxAttempts),
          content: parsed.value,
        },
        token || undefined
      );
      toast.success("Exame salvo!");
      onUpdated(updated);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao salvar exame");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Excluir este exame?")) return;
    try {
      setBusy(true);
      const token = getAuthTokenFromClient();
      await adminDeleteCareerExam(careerId, exam.id, token || undefined);
      toast.success("Exame excluído!");
      onDeleted();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao excluir exame");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={local.slug} onChange={(e) => setLocal({ ...local, slug: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={local.description} onChange={(e) => setLocal({ ...local, description: e.target.value })} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Nota mínima (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={local.passingScore}
            onChange={(e) => setLocal({ ...local, passingScore: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Máx. tentativas (opcional)</Label>
          <Input
            type="number"
            min={1}
            value={local.maxAttempts ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              setLocal({ ...local, maxAttempts: v === "" ? null : Number(v) });
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Conteúdo (JSON)</Label>
        <Textarea
          value={local.contentText}
          onChange={(e) => setLocal({ ...local, contentText: e.target.value })}
          rows={10}
          className={!parsed.ok ? "border-red-500" : undefined}
        />
        {!parsed.ok ? (
          <div className="text-sm text-red-500">JSON inválido: {parsed.error}</div>
        ) : (
          <div className="text-xs text-gray-500">JSON válido.</div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={busy || !parsed.ok} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar exame
        </Button>
        <Button onClick={remove} disabled={busy} variant="outline" className="gap-2">
          <Trash2 className="h-4 w-4 text-red-600" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

