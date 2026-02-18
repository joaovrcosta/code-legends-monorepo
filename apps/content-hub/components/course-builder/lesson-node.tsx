"use client";

import { useState } from "react";
import { LessonWithStructure } from "@/actions/course/get-course-with-structure";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { deleteLesson } from "@/actions/lesson/delete-lesson";
import { getAuthTokenFromClient } from "@/lib/auth";
import { LessonEditModal } from "./lesson-edit-modal";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LessonNodeProps {
  lesson: LessonWithStructure;
  onUpdate: (lesson: LessonWithStructure) => void;
  onDelete: () => void;
}

export function LessonNode({ lesson, onUpdate, onDelete }: LessonNodeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
        <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
          {lesson.title}
        </span>
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
