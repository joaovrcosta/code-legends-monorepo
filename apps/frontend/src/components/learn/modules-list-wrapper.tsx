"use client";

import { ModulesList } from "@/components/learn/modules-list";
import type { ModuleWithProgress } from "@/types/roadmap";

interface ModulesListWrapperProps {
  modules: ModuleWithProgress[];
  courseId: string;
  courseSlug: string;
}

export function ModulesListWrapper({
  modules,
  courseId,
  courseSlug,
}: ModulesListWrapperProps) {
  const handleToggle = () => {
    // Função vazia, pois nesta página sempre mostramos os módulos
  };

  const handleModuleChange = () => {
    // Função vazia, pois não há necessidade de atualizar roadmap nesta página
  };

  return (
    <ModulesList
      courseSlug={courseSlug}
      modules={modules}
      courseId={courseId}
      onToggle={handleToggle}
      onModuleChange={handleModuleChange}
    />
  );
}
