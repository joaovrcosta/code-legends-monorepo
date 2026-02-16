import { getActiveCourse } from "@/actions/user/get-active-course";
import { getCourseRoadmap } from "@/actions/course";
import { LearnPageContent } from "@/components/learn/learn-page-content";
import Link from "next/link";
import { PrimaryButton } from "@/components/ui/primary-button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aprender - Code Legends",
  description: "Acesse seus cursos, trilhas de aprendizado e continue sua jornada de programação.",
};

export default async function LearnPage() {
  const activeCourse = await getActiveCourse();

  if (!activeCourse) {
    return (
      <div className="flex items-center justify-center w-full h-[100dvh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Nenhum curso ativo encontrado. Selecione um curso para começar.
          </p>
          <Link href="/learn/catalog">
            <PrimaryButton>Explorar cursos</PrimaryButton>
          </Link>
        </div>
      </div>
    );
  }

  const roadmap = await getCourseRoadmap(activeCourse.id);

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center w-full h-[100dvh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Erro ao carregar o roadmap do curso.
          </p>
          <Link href="/learn/catalog">
            <PrimaryButton>Voltar para cursos</PrimaryButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LearnPageContent initialRoadmap={roadmap} activeCourse={activeCourse} />
  );
}
