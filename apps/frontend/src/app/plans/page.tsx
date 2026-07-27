import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PlansGrid } from "@/components/plans/plans-grid";
import { PlansBackButton } from "@/components/plans/plans-back-button";
import { listPlans } from "@/actions/plan/list-plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planos - Code Legends",
  description:
    "Escolha o plano ideal para sua jornada: comece grátis, assine PRO ou PREMIUM e tenha acesso a todo o catálogo e benefícios.",
};

export default async function PlansPage() {
  const { plans } = await listPlans();

  return (
    <div className="min-h-screen bg-black">
      {/* Gradiente em tons de azul */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-cyan-950/30 via-blue-950/10 to-transparent" />
        <div className="absolute top-0 right-0 w-[80vw] max-w-[800px] h-[500px] rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-20">
        <PlansBackButton />

        {/* Header: título à esquerda, pergunta + botão à direita */}
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-14 lg:mb-20">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
            Escolha seu plano
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
            <p className="text-sm text-zinc-400 max-w-[280px]">
              Precisa de ajuda para escolher o plano certo para sua jornada na Code Legends?
            </p>
            <Link
              href="#planos"
              className="shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#1a1a1e] text-sm font-semibold hover:bg-zinc-100 transition-colors border border-zinc-200"
            >
              Comparar planos
              <ArrowUpRight size={16} weight="bold" />
            </Link>
          </div>
        </header>

        {/* Três colunas de planos */}
        <section id="planos" className="scroll-mt-8">
          <PlansGrid apiPlans={plans} />
        </section>
      </div>
    </div>
  );
}
