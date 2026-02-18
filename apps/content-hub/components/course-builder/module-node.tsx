"use client";

import { useState } from "react";
import { ModuleWithStructure, GroupWithStructure } from "@/actions/course/get-course-with-structure";
import { GroupNode, type GroupNodeProps } from "./group-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, Save, X } from "lucide-react";
import { updateModule } from "@/actions/module/update-module";
import { deleteModule } from "@/actions/module/delete-module";
import { createGroup } from "@/actions/group/create-group";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";

interface ModuleNodeProps {
    module: ModuleWithStructure;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (module: ModuleWithStructure) => void;
    onDelete: () => void;
    onReloadStructure?: () => void;
}

export function ModuleNode({
    module,
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    onReloadStructure,
}: ModuleNodeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(module.title);
    const [loading, setLoading] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
        new Set(module.groups.map((g) => g.id))
    );

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
    };

    const handleGroupUpdate = (groupId: number, updatedGroup: GroupWithStructure) => {
        const updatedGroups = module.groups.map((g) =>
            g.id === groupId ? updatedGroup : g
        );
        onUpdate({ ...module, groups: updatedGroups });
    };

    const handleGroupDelete = (groupId: number) => {
        const updatedGroups = module.groups.filter((g) => g.id !== groupId);
        onUpdate({ ...module, groups: updatedGroups });
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            newSet.delete(groupId);
            return newSet;
        });
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800">
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
                                setTitle(module.title);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                            {module.title}
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
                <div className="p-3 space-y-2">
                    {module.groups.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                            Nenhum submódulo. Clique no botão + para adicionar.
                        </div>
                    ) : (
                        module.groups.map((group) => (
                            <GroupNode
                                key={group.id}
                                group={group}
                                isExpanded={expandedGroups.has(group.id)}
                                onToggle={() => toggleGroup(group.id)}
                                onUpdate={(updated) => handleGroupUpdate(group.id, updated)}
                                onDelete={() => handleGroupDelete(group.id)}
                                onReloadStructure={onReloadStructure}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
