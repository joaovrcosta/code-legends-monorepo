"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowDown, ArrowUp, ChevronDown, Plus, Save, Search, Trash2, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  const [infoOpen, setInfoOpen] = useState(true);
  const [modulesPanelOpen, setModulesPanelOpen] = useState(true);
  const [examsPanelOpen, setExamsPanelOpen] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    icon: "",
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
        icon: found.icon ?? "",
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
          icon: form.icon || null,
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Informações</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-gray-600 dark:text-gray-400"
              onClick={() => setInfoOpen((o) => !o)}
              aria-expanded={infoOpen}
              aria-controls="career-edit-info"
            >
              <span className="text-xs font-normal">
                {infoOpen ? "Recolher" : "Expandir"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  infoOpen && "rotate-180"
                )}
                aria-hidden
              />
            </Button>
          </CardHeader>
          {infoOpen ? (
          <CardContent id="career-edit-info">
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
                <Label htmlFor="icon">Ícone (URL)</Label>
                <Input
                  id="icon"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="https://… (SVG ou PNG)"
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
          ) : null}
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle>Módulos</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-600 dark:text-gray-400"
                  onClick={() => setModulesPanelOpen((o) => !o)}
                  aria-expanded={modulesPanelOpen}
                  aria-label={modulesPanelOpen ? "Recolher lista de módulos" : "Expandir lista de módulos"}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      modulesPanelOpen && "rotate-180"
                    )}
                  />
                </Button>
              </div>
              <Button onClick={handleAddModule} disabled={loading} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            {modulesPanelOpen ? (
            <CardContent className="space-y-4">
              {sortedModules.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhum módulo ainda.</div>
              ) : (
                sortedModules.map((m) => (
                  <CareerModuleCard
                    key={m.id}
                    careerId={careerId}
                    module={m}
                    allModules={modules}
                    allCourses={allCourses}
                    exams={exams}
                    onUpdated={(next) => {
                      setModules((prev) =>
                        prev.map((x) =>
                          x.id === next.id
                            ? { ...next, courses: next.courses ?? x.courses }
                            : x,
                        ),
                      );
                    }}
                    onDeleted={async () => {
                      setModules((prev) => prev.filter((x) => x.id !== m.id));
                    }}
                    onSetCourses={async (courses) => {
                      const token = getAuthTokenFromClient();
                      await adminSetCareerModuleCourses(m.id, courses, token || undefined);
                      toast.success("Cursos vinculados!");
                      await load();
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
            ) : null}
          </Card>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle>Exames</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-600 dark:text-gray-400"
                  onClick={() => setExamsPanelOpen((o) => !o)}
                  aria-expanded={examsPanelOpen}
                  aria-label={examsPanelOpen ? "Recolher lista de exames" : "Expandir lista de exames"}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      examsPanelOpen && "rotate-180"
                    )}
                  />
                </Button>
              </div>
              <Button onClick={handleAddExam} disabled={loading} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            {examsPanelOpen ? (
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
            ) : null}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

function CareerModuleCard({
  careerId,
  module,
  allModules,
  allCourses,
  exams,
  onUpdated,
  onDeleted,
  onSetCourses,
  onSetExams,
}: {
  careerId: string;
  module: CareerModule;
  allModules: CareerModule[];
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
  const [courseSearch, setCourseSearch] = useState("");
  const [exam1, setExam1] = useState<string>("");
  const [exam2, setExam2] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const linkedCourseIdsKey = useMemo(
    () =>
      (module.courses ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((l) => l.courseId)
        .join("|"),
    [module.courses],
  );

  useEffect(() => {
    const ids =
      (module.courses ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((l) => l.courseId);
    setSelectedCourses(ids);
  }, [module.id, linkedCourseIdsKey]);

  const occupiedElsewhere = useMemo(() => {
    const s = new Set<string>();
    for (const mod of allModules) {
      if (mod.id === module.id) continue;
      for (const row of mod.courses ?? []) {
        s.add(row.courseId);
      }
    }
    return s;
  }, [allModules, module.id]);

  const availableToAdd = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return allCourses.filter((c) => {
      if (occupiedElsewhere.has(c.id)) return false;
      if (selectedCourses.includes(c.id)) return false;
      if (!q) return true;
      const slug = (c.slug ?? "").toLowerCase();
      return c.title.toLowerCase().includes(q) || slug.includes(q);
    });
  }, [allCourses, occupiedElsewhere, selectedCourses, courseSearch]);

  const courseTitle = useCallback(
    (courseId: string) => {
      const fromList = allCourses.find((c) => c.id === courseId);
      if (fromList?.title) return fromList.title;
      const fromLink = module.courses?.find((l) => l.courseId === courseId)?.course?.title;
      return fromLink ?? courseId;
    },
    [allCourses, module.courses],
  );

  const moveCourse = (index: number, dir: -1 | 1) => {
    setSelectedCourses((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const t = next[index]!;
      next[index] = next[j]!;
      next[j] = t;
      return next;
    });
  };

  const removeCourseAt = (index: number) => {
    setSelectedCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const addCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev : [...prev, courseId],
    );
  };

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
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-gray-50/90 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800/80"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
          <span className="truncate font-medium text-gray-900 dark:text-gray-100">
            {local.title || "Módulo sem título"}
          </span>
          <span className="shrink-0 rounded-md bg-gray-200/80 px-1.5 py-0.5 text-xs tabular-nums text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            ordem {local.orderIndex}
          </span>
        </div>
        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {expanded ? "Recolher" : "Expandir"}
        </span>
      </button>
      {expanded ? (
        <div className="space-y-4 border-t border-gray-200 p-4 dark:border-gray-800">
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
        <div className="space-y-3">
          <div>
            <Label>Cursos vinculados a este módulo</Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Um mesmo curso não pode estar em dois módulos ao mesmo tempo. Use as setas para
              definir a ordem na trilha.
            </p>
          </div>

          <div className="min-h-20 space-y-1.5 rounded-lg border border-gray-200 bg-gray-50/50 p-2 dark:border-gray-700 dark:bg-gray-900/30">
            {selectedCourses.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Nenhum curso vinculado. Adicione abaixo.
              </p>
            ) : (
              selectedCourses.map((courseId, idx) => (
                <div
                  key={`${courseId}-${idx}`}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-950"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {courseTitle(courseId)}
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={busy || idx === 0}
                      onClick={() => moveCourse(idx, -1)}
                      aria-label="Mover curso para cima"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={busy || idx === selectedCourses.length - 1}
                      onClick={() => moveCourse(idx, 1)}
                      aria-label="Mover curso para baixo"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      disabled={busy}
                      onClick={() => removeCourseAt(idx)}
                      aria-label="Remover curso do módulo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button onClick={applyCourses} disabled={busy} variant="default" className="w-full sm:w-auto">
            Salvar vínculos ({selectedCourses.length})
          </Button>

          <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
            <Label htmlFor={`add-course-${module.id}`}>Adicionar curso</Label>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <Input
                id={`add-course-${module.id}`}
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Buscar por título ou slug…"
                className="pl-9"
                autoComplete="off"
              />
            </div>
            <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              {availableToAdd.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {allCourses.length === 0
                    ? "Nenhum curso cadastrado na plataforma."
                    : "Nenhum curso disponível (todos já vinculados a este ou a outro módulo)."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {availableToAdd.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => addCourse(c.id)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80 disabled:opacity-50"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-gray-900 dark:text-gray-100">
                          {c.title}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                          adicionar
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
      ) : null}
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
  const [expanded, setExpanded] = useState(false);
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
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-gray-50/90 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800/80"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200",
                expanded && "rotate-180"
              )}
              aria-hidden
            />
            <span className="truncate font-medium text-gray-900 dark:text-gray-100">
              {local.title || "Exame sem título"}
            </span>
          </div>
          <span className="truncate pl-6 text-xs text-gray-500 dark:text-gray-400 sm:pl-0">
            {local.slug}
          </span>
        </div>
        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {expanded ? "Recolher" : "Expandir"}
        </span>
      </button>
      {expanded ? (
        <div className="space-y-4 border-t border-gray-200 p-4 dark:border-gray-800">
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
      ) : null}
    </div>
  );
}

