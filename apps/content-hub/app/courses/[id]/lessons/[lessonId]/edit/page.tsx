"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { LessonEditView } from "@/components/course-builder/lesson-edit-modal";
import { LessonContextBreadcrumb } from "@/components/course-builder/lesson-context-breadcrumb";
import {
  getCourseWithStructure,
  type LessonWithStructure,
  type ModuleWithStructure,
} from "@/actions/course/get-course-with-structure";
import { getLessonById } from "@/actions/lesson/get-lesson-by-id";
import { getLessonProductionByCourse } from "@/actions/lesson/get-lesson-production-by-course";
import { getCourseSkillsConfig } from "@/actions/skill/get-course-skills";
import { getAuthTokenFromClient } from "@/lib/auth";
import {
  buildLessonBreadcrumbFromContext,
  findLessonContext,
  mergeLessonDetailIntoLesson,
  mergeProductionIntoModules,
  type LessonBreadcrumbContext,
} from "@/lib/course-structure";
import { toast } from "sonner";

export default function EditCourseLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = Number(params.lessonId);
  const backHref = `/courses/${courseId}/edit`;

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonWithStructure | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<LessonBreadcrumbContext | null>(
    null,
  );
  const [courseSkillIds, setCourseSkillIds] = useState<string[]>([]);
  const [modules, setModules] = useState<ModuleWithStructure[]>([]);

  const load = useCallback(async () => {
    if (!courseId || !Number.isFinite(lessonId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        router.push(backHref);
        return;
      }

      const [structure, lessonDetail, skillsConfig, production] =
        await Promise.all([
          getCourseWithStructure(courseId, {
            includeContent: false,
            token,
          }),
          getLessonById(lessonId, token),
          getCourseSkillsConfig(courseId, token),
          getLessonProductionByCourse(courseId, token),
        ]);

      if (!structure?.course) {
        toast.error("Curso não encontrado");
        router.push("/courses");
        return;
      }

      if (!lessonDetail) {
        toast.error("Aula não encontrada");
        router.push(backHref);
        return;
      }

      const modules = mergeProductionIntoModules(
        structure.modules,
        production.items,
      );
      const ctx = findLessonContext(modules, lessonId);
      if (!ctx) {
        toast.error("Aula não encontrada neste curso");
        router.push(backHref);
        return;
      }

      setModules(modules);
      setLesson(mergeLessonDetailIntoLesson(ctx.lesson, lessonDetail));
      setBreadcrumb(
        buildLessonBreadcrumbFromContext(ctx, structure.course.title),
      );
      setCourseSkillIds(
        (skillsConfig?.skills ?? []).map((skill) => skill.skillId),
      );
    } catch (error) {
      console.error("Erro ao carregar aula:", error);
      toast.error("Erro ao carregar aula para edição");
      router.push(backHref);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, backHref, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-8 text-center text-ch-muted">
          Carregando aula…
        </div>
      </MainLayout>
    );
  }

  if (!lesson || !breadcrumb) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Link href={backHref} className="mt-1">
            <Button variant="ghost" size="icon" aria-label="Voltar ao curso">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-ch">
              Editar Aula
            </h1>
            <LessonContextBreadcrumb
              context={breadcrumb}
              className="mt-3"
            />
          </div>
        </div>

        <LessonEditView
          lesson={lesson}
          courseSkillIds={courseSkillIds}
          modules={modules}
          breadcrumb={breadcrumb}
          variant="page"
          active
          onCancel={() => router.push(backHref)}
          onSave={() => {
            router.push(backHref);
          }}
        />
      </div>
    </MainLayout>
  );
}
