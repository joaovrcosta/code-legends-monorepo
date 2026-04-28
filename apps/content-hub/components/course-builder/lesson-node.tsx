"use client";

import { useState } from "react";
import { LessonWithStructure } from "@/actions/course/get-course-with-structure";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { deleteLesson } from "@/actions/lesson/delete-lesson";
import { getAuthTokenFromClient } from "@/lib/auth";
import { LessonEditModal } from "./lesson-edit-modal";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateLessonProduction } from "@/actions/lesson/update-lesson-production";
import type { LessonProductionStatus } from "@/actions/lesson/get-lesson-production-by-course";

function lessonTypeLabel(type: string): string {
  const key = type.trim().toLowerCase();
  switch (key) {
    case "video":
      return "Vídeo";
    case "article":
      return "Leitura";
    case "text":
      return "Texto";
    case "quiz":
      return "Quiz";
    case "multi_quiz":
      return "Multi quiz";
    case "project":
      return "Projeto";
    default:
      if (!key) return "Aula";
      return key
        .split(/[\s_]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

function productionStatusLabel(status: LessonProductionStatus): string {
  switch (status) {
    case "TODO":
      return "A fazer";
    case "IN_PROGRESS":
      return "Em produção";
    case "REVIEW":
      return "Em revisão";
    case "DONE":
      return "Feita";
    case "BLOCKED":
      return "Bloqueada";
    default:
      return status;
  }
}

function productionStatusBadgeClass(status: LessonProductionStatus): string {
  switch (status) {
    case "DONE":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "REVIEW":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "IN_PROGRESS":
      return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "BLOCKED":
      return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400";
    case "TODO":
    default:
      return "border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-300";
  }
}

interface LessonNodeProps {
  lesson: LessonWithStructure;
  onUpdate: (lesson: LessonWithStructure) => void;
  onDelete: () => void;
  courseSkillIds?: string[];
}

export function LessonNode({
  lesson,
  onUpdate,
  onDelete,
  courseSkillIds,
}: LessonNodeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productionLoading, setProductionLoading] = useState(false);

  const productionStatus: LessonProductionStatus =
    (lesson.production?.status as LessonProductionStatus | undefined) ?? "TODO";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a aula "${lesson.title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }

      await deleteLesson(lesson.id.toString(), token);
      onDelete();
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir aula");
    } finally {
      setLoading(false);
    }
  };

  const handleProductionStatusChange = async (next: LessonProductionStatus) => {
    try {
      setProductionLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      const result = await updateLessonProduction(lesson.id, { status: next }, token);
      onUpdate({
        ...lesson,
        production: result.item,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status editorial:", error);
      toast.error(error?.message ?? "Erro ao atualizar status editorial");
    } finally {
      setProductionLoading(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded ml-4"
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
        <span className="flex-1 min-w-0 text-sm text-gray-600 dark:text-gray-400">
          {lesson.title}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className={`${productionStatusBadgeClass(productionStatus)} font-normal`}
            title="Status editorial"
          >
            {productionStatusLabel(productionStatus)}
          </Badge>
          <select
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            value={productionStatus}
            onChange={(e) => handleProductionStatusChange(e.target.value as LessonProductionStatus)}
            disabled={productionLoading || loading}
            aria-label="Alterar status editorial"
          >
            <option value="TODO">A fazer</option>
            <option value="IN_PROGRESS">Em produção</option>
            <option value="REVIEW">Em revisão</option>
            <option value="DONE">Feita</option>
            <option value="BLOCKED">Bloqueada</option>
          </select>
          <Badge
            variant="outline"
            className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-normal"
          >
            {lessonTypeLabel(lesson.type)}
          </Badge>
          {lesson.isFree && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400">
              Grátis
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>

      <LessonEditModal
        lesson={lesson}
        courseSkillIds={courseSkillIds}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(updatedLesson) => {
          onUpdate(updatedLesson);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
