import { listModulesProgress } from "@/actions/course";
import { getActiveCourse } from "@/actions/user";
import { ModulesListWrapper } from "@/components/learn/modules-list-wrapper";

export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const activeCourse = await getActiveCourse();

  if (!activeCourse) {
    return (
      <div className="flex items-center justify-center w-full h-[100dvh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Nenhum curso ativo encontrado.
          </p>
        </div>
      </div>
    );
  }

  const modulesData = await listModulesProgress(activeCourse?.slug);

  if (!modulesData?.modules) {
    return (
      <div className="flex items-center justify-center w-full h-[100dvh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Nenhum módulo encontrado para este curso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>

      <ModulesListWrapper
        modules={modulesData.modules}
        courseId={activeCourse.id}
        courseSlug={activeCourse.slug}
      />
    </div>
  );
}
