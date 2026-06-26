"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, BookOpen, Lock } from "lucide-react";
import { toast } from "sonner";
import { getAuthTokenFromClient } from "@/lib/auth";

type CourseStatus = "DRAFT" | "REVIEW" | "PUBLISHED";

interface KanbanCourse {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  thumbnail: string | null;
  instructor: { name: string };
}

interface Column {
  id: CourseStatus;
  label: string;
  color: string;
  locked?: boolean;
}

const columns: Column[] = [
  { id: "DRAFT", label: "Rascunho", color: "bg-ch-surface-raised" },
  { id: "REVIEW", label: "Em Revisão", color: "bg-yellow-50 dark:bg-yellow-950" },
  { id: "PUBLISHED", label: "Publicado ✅", color: "bg-green-50 dark:bg-green-950" },
];

function CourseCard({ course, isDragging }: { course: KanbanCourse; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-3 rounded-md border border-ch-border bg-ch-surface p-3 shadow-sm border-ch-border bg-ch-surface-raised"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab text-ch-muted hover:text-ch-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-ch dark:text-white">{course.title}</p>
        <p className="text-xs text-ch-muted">{course.instructor.name}</p>
      </div>
      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-ch-muted" />
    </div>
  );
}

async function updateCourseStatus(token: string, courseId: string, status: CourseStatus) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Falha ao atualizar status do curso");
  }
}

interface CourseKanbanProps {
  initialCourses: KanbanCourse[];
  userRole: string;
}

export function CourseKanban({ initialCourses, userRole }: CourseKanbanProps) {
  const [courses, setCourses] = useState<KanbanCourse[]>(initialCourses);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getColumn = (status: CourseStatus) => courses.filter((c) => c.status === status);

  const activeCourse = activeId ? courses.find((c) => c.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    // over.id could be a column id (CourseStatus) or a course id
    const targetColumnId = columns.find((c) => c.id === over.id)?.id as CourseStatus | undefined;
    const targetCourseColumn = courses.find((c) => c.id === over.id)?.status;
    const newStatus: CourseStatus | undefined = targetColumnId ?? targetCourseColumn;

    const draggedCourse = courses.find((c) => c.id === active.id);
    if (!draggedCourse || !newStatus || draggedCourse.status === newStatus) return;

    // RLS: Only ADMIN can move to PUBLISHED
    if (newStatus === "PUBLISHED" && userRole !== "ADMIN") {
      toast.error("Apenas Administradores podem publicar cursos.");
      return;
    }

    // Optimistic update
    setCourses((prev) => prev.map((c) => (c.id === active.id ? { ...c, status: newStatus } : c)));

    try {
      const token = getAuthTokenFromClient();
      if (!token) throw new Error("Sessão expirada");
      await updateCourseStatus(token, active.id as string, newStatus);
    } catch (err: any) {
      toast.error(err.message || "Erro ao mover curso");
      // Rollback
      setCourses((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, status: draggedCourse.status } : c))
      );
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const colCourses = getColumn(col.id);
          return (
            <div key={col.id} className={`rounded-xl p-4 ${col.color}`} id={col.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ch-muted">{col.label}</h3>
                <span className="rounded-full bg-ch-surface px-2 py-0.5 text-xs font-bold text-ch-muted shadow dark:bg-ch-surface-raised text-ch-muted">
                  {colCourses.length}
                </span>
              </div>
              {/* Drop zone for the column itself */}
              <div
                id={col.id}
                className="min-h-[160px] space-y-2 rounded-lg border-2 border-dashed border-transparent p-1 transition-colors"
              >
                <SortableContext
                  id={col.id}
                  items={colCourses.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colCourses.length === 0 ? (
                    <p className="py-8 text-center text-sm text-ch-muted">Sem cursos</p>
                  ) : (
                    colCourses.map((course) => (
                      <CourseCard key={course.id} course={course} isDragging={course.id === activeId} />
                    ))
                  )}
                </SortableContext>
              </div>
              {col.id === "PUBLISHED" && userRole !== "ADMIN" && (
                <div className="mt-2 flex items-center gap-1 text-xs text-ch-muted">
                  <Lock className="h-3 w-3" />
                  Apenas admins podem publicar
                </div>
              )}
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeCourse ? (
          <div className="rounded-md border border-ch-accent/40 bg-ch-surface p-3 shadow-xl bg-ch-surface-raised">
            <p className="text-sm font-medium">{activeCourse.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
