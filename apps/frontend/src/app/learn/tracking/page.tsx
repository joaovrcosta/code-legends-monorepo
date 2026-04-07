import { getMySkills } from "@/actions/user/get-my-skills";
import { SkillsTrackingCard } from "@/components/learn/skills-tracking-card";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minha jornada - Code Legends",
  description: "Acompanhe seu progresso por skills e tecnologias.",
};

export default async function TrackingPage() {
  const { skills } = await getMySkills();

  return (
    <div className="py-4 lg:px-12 px-0">
      <div className="w-full flex-col px-0 py-6 flex">
        <div className="flex flex-wrap items-center gap-2">

          <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg">
            Minha jornada
          </span>
          <span className="rounded-full border border-[#25252A] px-2 py-0.5 text-xs text-[#C4C4CC]">
            Beta
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm text-[#C4C4CC]">
          Visão geral do XP acumulado por matéria e tecnologia.
        </p>
      </div>

      <div className="w-full">
        <SkillsTrackingCard skills={skills} />
      </div>
    </div>
  );
}
