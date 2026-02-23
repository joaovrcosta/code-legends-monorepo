"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

const ICON_COLORS = [
  "from-purple-500 to-purple-700",
  "from-cyan-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-blue-500",
  "from-green-500 to-emerald-600",
  "from-orange-400 to-purple-500",
];

export function LessonPaywall() {
  return (
    <div className="flex-1 flex flex-col min-h-0 items-center justify-center px-4 py-8 lg:py-12">
      <div className="w-full max-w-[480px] flex flex-col items-center text-center">
        {/* Ícones de tecnologias / cursos */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {ICON_COLORS.map((gradient, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
            >
              {i === 0 ? "IA" : i === 4 ? "JS" : String(i + 1)}
            </div>
          ))}
        </div>

        <h1 className="text-xl lg:text-2xl font-bold text-white mb-3">
          Esse é um conteúdo exclusivo para assinantes
        </h1>
        <p className="text-sm lg:text-base text-[#C4C4CC] mb-8 leading-relaxed">
          Assinando agora você recebe acesso imediato a todos os conteúdos do
          catálogo em uma única assinatura. Aprenda do zero ao avançado com
          projetos práticos e certificados.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="rounded-full border-[#25252A] bg-[#25252A]/80 text-white hover:bg-[#25252A] h-12 px-6 gap-2"
            asChild
          >
            <Link href="/learn/catalog">
              Saiba mais
              <ArrowUpRight size={18} weight="bold" />
            </Link>
          </Button>
          <Button
            className="rounded-full bg-blue-gradient-500 hover:opacity-90 h-12 px-6 gap-2 border-0"
            asChild
          >
            <Link href="/cart/pro">
              Quero assinar
              <ArrowUpRight size={18} weight="bold" />
            </Link>
          </Button>
        </div>

        <Link
          href="/learn"
          className="mt-8 text-sm text-[#7e7e89] hover:text-[#C4C4CC] transition-colors"
        >
          Fale com a gente
        </Link>
      </div>
    </div>
  );
}
