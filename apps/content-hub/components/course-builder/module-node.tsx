"use client";

import { useEffect, useRef, useState } from "react";
import { ModuleWithStructure, GroupWithStructure } from "@/actions/course/get-course-with-structure";
import { GroupNode } from "./group-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Save, X, ChevronRight, GripVertical } from "lucide-react";
import { ModuleFolderIcon } from "./course-tree-icons";
import { updateModule } from "@/actions/module/update-module";
import { deleteModule } from "@/actions/module/delete-module";
import { createGroup } from "@/actions/group/create-group";
import { reorderGroups } from "@/actions/group/reorder-groups";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function sortGroups(groups: GroupWithStructure[]) {
    return [...groups].sort((a, b) => a.orderIndex - b.orderIndex);
}

interface ModuleNodeProps {
    module: ModuleWithStructure;
    moduleNumber?: number;
    collapseAllKey?: number;
    expandAllKey?: number;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (module: ModuleWithStructure) => void;
    onDelete: () => void;
    onReloadStructure?: () => void;
    courseSkillIds?: string[];
    courseTitle: string;
    modules: ModuleWithStructure[];
}

export function ModuleNode({
    module,
    moduleNumber,
    collapseAllKey,
    expandAllKey,
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    onReloadStructure,
    courseSkillIds,
    courseTitle,
    modules,
}: ModuleNodeProps) {
    const storageKey = `cb:${module.courseId}:expandedGroups:${module.id}`;
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(module.title);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<GroupWithStructure[]>(() =>
        sortGroups(module.groups),
    );
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
        () => {
            if (typeof window === "undefined") return new Set();
            try {
                const raw = window.localStorage.getItem(storageKey);
                if (!raw) return new Set(module.groups.map((g) => g.id));
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed))
                    return new Set(parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n)));
            } catch {}
            return new Set(module.groups.map((g) => g.id));
        }
    );

    const lastCollapseKeyRef = useRef<number | undefined>(collapseAllKey);
    const lastExpandKeyRef = useRef<number | undefined>(expandAllKey);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    const sortableStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        const sorted = sortGroups(module.groups);
        setGroups((prev) => {
            if (
                prev.length !== sorted.length ||
                prev.some(
                    (p, i) =>
                        p.id !== sorted[i]?.id ||
                        p.orderIndex !== sorted[i]?.orderIndex,
                )
            ) {
                return sorted;
            }
            return prev;
        });
    }, [module.groups]);

    useEffect(() => {
        if (collapseAllKey == null) return;
        // Evita colapsar na montagem inicial (senão fecha tudo no refresh).
        if (lastCollapseKeyRef.current === collapseAllKey) return;
        lastCollapseKeyRef.current = collapseAllKey;
        setExpandedGroups(new Set());
        try {
            window.localStorage.setItem(storageKey, JSON.stringify([]));
        } catch {}
    }, [collapseAllKey]);

    useEffect(() => {
        if (expandAllKey == null) return;
        if (lastExpandKeyRef.current === expandAllKey) return;
        lastExpandKeyRef.current = expandAllKey;
        const allGroupIds = new Set(groups.map((g) => g.id));
        setExpandedGroups(allGroupIds);
        try {
            window.localStorage.setItem(storageKey, JSON.stringify([...allGroupIds]));
        } catch {}
    }, [expandAllKey, groups, storageKey]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            await updateModule(module.id, { title }, token);
            onUpdate({ ...module, title });
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar módulo:", error);
            toast.error("Erro ao atualizar módulo");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o módulo "${module.title}"?`)) {
            return;
        }

        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            await deleteModule(module.id, token);
            onDelete();
        } catch (error) {
            console.error("Erro ao excluir módulo:", error);
            toast.error("Erro ao excluir módulo");
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = async () => {
        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            const groupNumber = module.groups.length + 1;
            const newGroup = await createGroup(
                module.id,
                { title: `Submódulo ${groupNumber}` },
                token
            );

            const updatedGroups: GroupWithStructure[] = [
                ...module.groups,
                {
                    id: newGroup.group.id,
                    title: newGroup.group.title,
                    moduleId: newGroup.group.moduleId,
                    orderIndex: module.groups.length,
                    lessons: [],
                },
            ];

            onUpdate({ ...module, groups: updatedGroups });
            setGroups(updatedGroups);
            setExpandedGroups((prev) => new Set([...prev, newGroup.group.id]));
        } catch (error) {
            console.error("Erro ao criar submódulo:", error);
            toast.error("Erro ao criar submódulo");
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (groupId: number) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
        try {
            window.localStorage.setItem(storageKey, JSON.stringify([...newExpanded]));
        } catch {}
    };

    const handleGroupUpdate = (groupId: number, updatedGroup: GroupWithStructure) => {
        const updatedGroups = groups.map((g) =>
            g.id === groupId ? updatedGroup : g
        );
        setGroups(updatedGroups);
        onUpdate({ ...module, groups: updatedGroups });
    };

    const handleGroupDelete = (groupId: number) => {
        const updatedGroups = groups.filter((g) => g.id !== groupId);
        setGroups(updatedGroups);
        onUpdate({ ...module, groups: updatedGroups });
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            newSet.delete(groupId);
            return newSet;
        });
    };

    const handleGroupDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = groups.findIndex((g) => g.id.toString() === active.id);
        const newIndex = groups.findIndex((g) => g.id.toString() === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newGroups = arrayMove(groups, oldIndex, newIndex);
        setGroups(newGroups);

        try {
            const token = getAuthTokenFromClient();
            if (!token) {
                setGroups(groups);
                return;
            }

            const reorderData = newGroups.map((group, index) => ({
                groupId: group.id,
                orderIndex: index,
            }));
            await reorderGroups(reorderData, token);

            const updatedGroups = newGroups.map((group, index) => ({
                ...group,
                orderIndex: index,
            }));
            onUpdate({ ...module, groups: updatedGroups });
        } catch (error) {
            console.error("Erro ao reordenar submódulos:", error);
            setGroups(groups);
            toast.error("Erro ao reordenar submódulos. Tente novamente.");
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={sortableStyle}
            className="group overflow-hidden rounded-lg border border-ch-border bg-ch-surface transition-colors hover:border-ch-border/80"
        >
            <div className="flex items-center gap-2 p-2.5 bg-ch-surface-raised/60 group-hover:bg-ch-surface-raised">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded p-1 text-ch-muted active:cursor-grabbing hover:bg-ch-surface-raised hover:text-ch"
                    aria-label="Arrastar para reordenar módulo"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onToggle}
                    className="group/toggle flex shrink-0 items-center gap-1.5 rounded-md p-1 transition-colors hover:bg-ch-surface-raised"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Recolher módulo" : "Expandir módulo"}
                >
                    <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 text-ch-muted transition-all duration-200 group-hover/toggle:text-ch ${isExpanded ? "rotate-90" : ""}`}
                    />
                    <ModuleFolderIcon
                        open={isExpanded}
                        className="text-sky-500 transition-colors group-hover/toggle:text-sky-400"
                    />
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
                                setTitle(module.title);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-ch-muted">
                                Módulo {moduleNumber ?? module.orderIndex + 1}
                            </div>
                            <div className="font-medium text-ch truncate">
                                {module.title}
                            </div>
                        </div>
                        <span className="hidden shrink-0 rounded-md bg-ch-canvas px-1.5 py-0.5 text-[10px] tabular-nums text-ch-muted sm:inline">
                            {module.groups.length}{" "}
                            {module.groups.length === 1 ? "pasta" : "pastas"}
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
                            onClick={handleAddGroup}
                            disabled={loading}
                        >
                            <Plus className="h-4 w-4" />
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
                <div className="space-y-1.5 border-t border-ch-border/60 py-2 pl-4 pr-2 ml-3 border-l border-l-ch-border/50">
                    {groups.length === 0 ? (
                        <div className="py-2 pl-2 text-sm text-ch-muted">
                            Nenhum submódulo. Clique no botão + para adicionar.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleGroupDragEnd}
                        >
                            <SortableContext
                                items={groups.map((group) => group.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {groups.map((group, idx) => (
                                    <GroupNode
                                        key={group.id}
                                        group={group}
                                        groupNumber={idx + 1}
                                        isExpanded={expandedGroups.has(group.id)}
                                        onToggle={() => toggleGroup(group.id)}
                                        onUpdate={(updated) => handleGroupUpdate(group.id, updated)}
                                        onDelete={() => handleGroupDelete(group.id)}
                                        onReloadStructure={onReloadStructure}
                                        courseSkillIds={courseSkillIds}
                                        courseTitle={courseTitle}
                                        moduleTitle={module.title}
                                        modules={modules}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            )}
        </div>
    );
}
