"use client";

import { useState, useEffect } from "react";
import { GroupWithStructure, LessonWithStructure } from "@/actions/course/get-course-with-structure";
import { LessonNode } from "./lesson-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, Save, X, FileJson } from "lucide-react";
import { updateGroup } from "@/actions/group/update-group";
import { deleteGroup } from "@/actions/group/delete-group";
import { createLesson } from "@/actions/lesson/create-lesson";
import { getAuthTokenFromClient } from "@/lib/auth";
import { ImportLessonsModal } from "./import-lessons-modal";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { reorderLessons } from "@/actions/lesson/reorder-lessons";
import { toast } from "sonner";

export interface GroupNodeProps {
    group: GroupWithStructure;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (group: GroupWithStructure) => void;
    onDelete: () => void;
    onReloadStructure?: () => void;
}

export function GroupNode({
    group,
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    onReloadStructure,
}: GroupNodeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(group.title);
    const [loading, setLoading] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [lessons, setLessons] = useState<LessonWithStructure[]>(() => {
        // Ordenar aulas por ordem ao inicializar
        return [...group.lessons].sort((a, b) => a.order - b.order);
    });

    // Atualizar lessons quando group.lessons mudar
    useEffect(() => {
        // Ordenar aulas por ordem ao atualizar
        const sortedLessons = [...group.lessons].sort((a, b) => a.order - b.order);
        setLessons(sortedLessons);
    }, [group.lessons]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = lessons.findIndex((lesson) => lesson.id.toString() === active.id);
        const newIndex = lessons.findIndex((lesson) => lesson.id.toString() === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        // Atualizar ordem localmente
        const newLessons = arrayMove(lessons, oldIndex, newIndex);
        setLessons(newLessons);

        // Atualizar ordem no backend
        try {
            const token = getAuthTokenFromClient();
            if (!token) {
                // Reverter se não houver token
                setLessons(lessons);
                return;
            }

            // Criar array com as novas ordens
            const reorderData = newLessons.map((lesson, index) => ({
                lessonId: lesson.id,
                order: index,
            }));

            await reorderLessons(reorderData, token);

            // Atualizar o estado do grupo com as novas ordens
            const updatedLessons = newLessons.map((lesson, index) => ({
                ...lesson,
                order: index,
            }));

            onUpdate({ ...group, lessons: updatedLessons });
        } catch (error) {
            console.error("Erro ao reordenar aulas:", error);
            // Reverter em caso de erro
            setLessons(lessons);
            toast.error("Erro ao reordenar aulas. Tente novamente.");
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            await updateGroup(group.id, { title }, token);
            onUpdate({ ...group, title });
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar submódulo:", error);
            toast.error("Erro ao atualizar submódulo");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o submódulo "${group.title}"?`)) {
            return;
        }

        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            await deleteGroup(group.id, token);
            onDelete();
        } catch (error) {
            console.error("Erro ao excluir submódulo:", error);
            toast.error("Erro ao excluir submódulo");
        } finally {
            setLoading(false);
        }
    };

    const handleAddLesson = async () => {
        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            const lessonNumber = lessons.length + 1;
            const newLesson = await createLesson(
                group.id,
                {
                    title: `Aula ${lessonNumber}`,
                    description: "",
                    type: "video",
                    slug: `aula-${lessonNumber}`,
                    order: lessons.length,
                },
                token
            );

            const updatedLessons: LessonWithStructure[] = [
                ...lessons,
                {
                    id: parseInt(newLesson.lesson.id),
                    title: newLesson.lesson.title,
                    description: newLesson.lesson.description,
                    type: newLesson.lesson.type,
                    slug: newLesson.lesson.slug,
                    url: newLesson.lesson.url || null,
                    isFree: newLesson.lesson.isFree,
                    video_url: newLesson.lesson.video_url || null,
                    video_duration: newLesson.lesson.video_duration || null,
                    locked: newLesson.lesson.locked,
                    completed: false,
                    submoduleId: group.id,
                    order: newLesson.lesson.order || lessons.length,
                    createdAt: newLesson.lesson.createdAt,
                    updatedAt: newLesson.lesson.updatedAt,
                    authorId: "", // Será preenchido pela API
                },
            ];

            setLessons(updatedLessons);
            onUpdate({ ...group, lessons: updatedLessons });
        } catch (error) {
            console.error("Erro ao criar aula:", error);
            toast.error("Erro ao criar aula");
        } finally {
            setLoading(false);
        }
    };

    const handleLessonUpdate = (lessonId: number, updatedLesson: LessonWithStructure) => {
        const updatedLessons = lessons.map((l) =>
            l.id === lessonId ? updatedLesson : l
        );
        setLessons(updatedLessons);
        onUpdate({ ...group, lessons: updatedLessons });
    };

    const handleLessonDelete = (lessonId: number) => {
        const updatedLessons = lessons.filter((l) => l.id !== lessonId);
        setLessons(updatedLessons);
        onUpdate({ ...group, lessons: updatedLessons });
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg ml-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800">
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </button>

                {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex-1"
                            autoFocus
                        />
                        <Button size="sm" onClick={handleSave} disabled={loading}>
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsEditing(false);
                                setTitle(group.title);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                            {group.title}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                            disabled={loading}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleAddLesson}
                            disabled={loading}
                            title="Adicionar aula"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsImportModalOpen(true)}
                            disabled={loading}
                            title="Importar aulas via JSON"
                        >
                            <FileJson className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </>
                )}
            </div>

            {isExpanded && (
                <div className="p-2 space-y-1">
                    {lessons.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                            Nenhuma aula. Clique no botão + para adicionar.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={lessons.map((lesson) => lesson.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {lessons.map((lesson) => (
                                    <LessonNode
                                        key={lesson.id}
                                        lesson={lesson}
                                        onUpdate={(updated) => handleLessonUpdate(lesson.id, updated)}
                                        onDelete={() => handleLessonDelete(lesson.id)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            )}

            <ImportLessonsModal
                groupId={group.id}
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportComplete={() => {
                    setIsImportModalOpen(false);
                    // Recarregar estrutura completa
                    if (onReloadStructure) {
                        onReloadStructure();
                    }
                }}
            />
        </div>
    );
}
