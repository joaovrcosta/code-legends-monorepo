"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCourses, deleteCourse, type Course } from "@/actions/course";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Plus, Edit, Trash2, LayoutList, Kanban, ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CourseKanban } from "@/components/courses/course-kanban";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  DRAFT:      { label: "Rascunho",    classes: "bg-ch-surface-raised text-ch-muted" },
  REVIEW:     { label: "Em Revisão",  classes: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  PUBLISHED:  { label: "Publicado",   classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [userRole, setUserRole] = useState("INSTRUCTOR");

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      const { courses: data } = await listCourses({ token: token || undefined });
      setCourses(data);
    } catch (error) {
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
    // Read role from decoded token stored in localStorage
    try {
      const token = getAuthTokenFromClient();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload?.role || "INSTRUCTOR");
      }
    } catch {}
  }, [loadCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    try {
      const token = getAuthTokenFromClient();
      if (!token) return;
      await deleteCourse(id, token);
      toast.success("Curso excluído.");
      loadCourses();
    } catch {
      toast.error("Erro ao excluir curso");
    }
  };

  // Map courses to the shape the Kanban expects
  const kanbanCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: (c.status as "DRAFT" | "REVIEW" | "PUBLISHED") ?? "DRAFT",
    thumbnail: c.thumbnail ?? null,
    // Como a listagem de cursos não traz o objeto de instrutor completo,
    // usamos apenas um placeholder a partir do instructorId.
    instructor: { name: c.instructorId ? "Instrutor" : "Desconhecido" },
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Cursos"
          description="Gerencie todos os cursos da plataforma"
          actions={
            <>
              <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                size="sm"
                options={[
                  {
                    value: "table",
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <LayoutList className="h-3.5 w-3.5" />
                        Lista
                      </span>
                    ),
                  },
                  {
                    value: "kanban",
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <Kanban className="h-3.5 w-3.5" />
                        Kanban
                      </span>
                    ),
                  },
                ]}
              />
              <Link href="/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Curso
                </Button>
              </Link>
            </>
          }
        />

        {loading ? (
          <div className="py-12 text-center text-ch-muted">Carregando...</div>
        ) : viewMode === "kanban" ? (
          <div>
            <p className="mb-4 text-sm text-ch-muted">
              Arraste os cursos entre as colunas para atualizar o status de publicação.
              {userRole !== "ADMIN" && " Apenas Admins podem mover para Publicado."}
            </p>
            <CourseKanban initialCourses={kanbanCourses} userRole={userRole} />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[72px]">Ícone</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Alunos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-ch-muted">
                        Nenhum curso encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course) => {
                      const badge = STATUS_BADGE[course.status] ?? STATUS_BADGE.DRAFT;
                      return (
                        <TableRow key={course.id}>
                          <TableCell className="align-middle">
                            {course.icon ? (
                              // eslint-disable-next-line @next/next/no-img-element -- URLs de ícone variam (S3/CDN); evita configurar cada host no next.config
                              <img
                                src={course.icon}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover border border-ch-border bg-ch-surface-raised"
                              />
                            ) : (
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-ch-border bg-ch-canvas bg-ch-surface-raised/50 text-ch-muted"
                                title="Sem ícone"
                              >
                                <ImageIcon className="h-4 w-4" aria-hidden />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{course.slug}</TableCell>
                          <TableCell>{course.level}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {course._count?.userCourses ?? 0}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/courses/${course.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
