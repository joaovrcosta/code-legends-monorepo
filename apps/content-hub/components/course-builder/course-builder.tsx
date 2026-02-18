"use client";

import { useState } from "react";
import { ModuleWithStructure } from "@/actions/course/get-course-with-structure";
import { ModuleNode } from "./module-node";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createModule } from "@/actions/module/create-module";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";

interface CourseBuilderProps {
    courseId: string;
    modules: ModuleWithStructure[];
    onModulesChange: (modules: ModuleWithStructure[]) => void;
    onReloadStructure?: () => void;
}

export function CourseBuilder({
    courseId,
    modules,
    onModulesChange,
    onReloadStructure,
}: CourseBuilderProps) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(modules.map((m) => m.id))
    );
    const [loading, setLoading] = useState(false);

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const handleAddModule = async () => {
        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            const moduleNumber = modules.length + 1;
            const moduleTitle = `Módulo ${moduleNumber}`;
            const newModule = await createModule(
                courseId,
                {
                    title: moduleTitle,
                    slug: generateSlug(moduleTitle),
                },
                token
            );

            // Recarregar estrutura completa
            // Por enquanto, vamos adicionar manualmente
            const updatedModules = [
                ...modules,
                {
                    id: newModule.module.id,
                    title: newModule.module.title,
                    slug: newModule.module.slug,
                    courseId: newModule.module.courseId,
                    orderIndex: modules.length,
                    groups: [],
                },
            ];

            onModulesChange(updatedModules);
            setExpandedModules((prev) => new Set([...prev, newModule.module.id]));
        } catch (error: any) {
            console.error("Erro ao criar módulo:", error);
            const errorMessage = error?.message || "Erro ao criar módulo";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleModuleUpdate = (moduleId: string, updatedModule: ModuleWithStructure) => {
        const updatedModules = modules.map((m) =>
            m.id === moduleId ? updatedModule : m
        );
        onModulesChange(updatedModules);
    };

    const handleModuleDelete = (moduleId: string) => {
        const updatedModules = modules.filter((m) => m.id !== moduleId);
        onModulesChange(updatedModules);
        setExpandedModules((prev) => {
            const newSet = new Set(prev);
            newSet.delete(moduleId);
            return newSet;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Estrutura do Curso
                </h3>
                <Button onClick={handleAddModule} disabled={loading} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Módulo
                </Button>
            </div>

            <div className="space-y-2">
                {modules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Nenhum módulo cadastrado. Clique em "Adicionar Módulo" para começar.
                    </div>
                ) : (
                    modules
                        .filter((module) => module.id) // Filtrar módulos sem ID válido
                        .map((module) => (
                            <ModuleNode
                                key={module.id}
                                module={module}
                                isExpanded={expandedModules.has(module.id)}
                                onToggle={() => toggleModule(module.id)}
                                onUpdate={(updated) => handleModuleUpdate(module.id, updated)}
                                onDelete={() => handleModuleDelete(module.id)}
                                onReloadStructure={onReloadStructure}
                            />
                        ))
                )}
            </div>
        </div>
    );
}
