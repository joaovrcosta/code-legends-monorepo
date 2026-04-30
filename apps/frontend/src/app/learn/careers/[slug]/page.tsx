import { getCareerBySlug } from "@/actions/career";
import { EnrollCareerButton } from "@/components/career/enroll-career-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAuroraBackground } from "@/utils/hexToRgb";
import { Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCareerBySlug(slug);

  return (
    <div className="w-full">
      {/* Banner full-width */}
      <section
        className="relative w-full border-b border-[#25252A] px-4 pb-8 pt-6 lg:px-12 lg:py-12"
        style={getAuroraBackground(data.career.colorHex)}
      >
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

        <div className="mx-auto w-full max-w-[1420px]">
          <div className="relative z-10 flex w-full flex-col items-center lg:items-start">
            {data.career.thumbnail ? (
              <div className="mb-4 flex items-center justify-center lg:justify-start">
                <Image
                  src={data.career.thumbnail}
                  alt={data.career.title}
                  width={120}
                  height={120}
                  className="relative lg:right-[12px] right-0"
                />
              </div>
            ) : null}

            <span className="mb-4 shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">
              Carreira
            </span>

            <h1 className="font-bold lg:text-[44px] text-2xl lg:text-left leading-tight text-center mb-3 text-white">
              {data.career.title}
            </h1>

            {data.career.description ? (
              <p className="lg:text-base text-sm mt-1 text-center lg:text-left max-w-[620px] text-[#a5a5a6]">
                {data.career.description}
              </p>
            ) : null}

            <div className="mt-6 flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full max-w-[500px]">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#7e7e89]">
                  <span>Seu Progresso</span>
                  <span className="text-white text-sm">
                    {Math.round(data.enrollment.progress)}%
                  </span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={data.enrollment.progress}
                    className="h-[2px] bg-surface-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo limitado */}
      <div className="mx-auto flex w-full max-w-[1420px] flex-col items-start mt-6">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Coluna esquerda: módulos */}
          <div id="modulos" className="min-w-0 space-y-4">
            {data.modules.map((m) => (
              <div
                key={m.id}
                className="w-full rounded-2xl py-4 px-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg">
                      {m.title}
                    </span>
                    {m.description ? (
                      <p className="mt-1 text-sm text-white/60">{m.description}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-white/70">
                      Exames: {m.status.examsPassedCount}/{m.exams.length}
                    </div>
                    <div
                      className={[
                        "mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        m.status.isCompleted
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-white/10 text-white/60",
                      ].join(" ")}
                    >
                      {m.status.isCompleted ? "Aprovado" : "Pendente"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="">
                    <ul className="mt-3 space-y-2">
                      {m.courses.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {c.icon ? (
                              <span className="relative block h-10 w-10 shrink-0 overflow-hidden">
                                <Image
                                  src={c.icon}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </span>
                            ) : (
                              <span
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#25252A] bg-[#0D0D12] text-base text-white/70"
                                aria-hidden
                              >
                                📘
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-white/90">
                                {c.title}
                              </div>
                              <div className="text-xs text-white/50">
                                Progresso no curso: {c.progress}%
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/learn/paths/${c.slug}`}
                            className="text-xs font-semibold text-[#00C8FF] mr-2"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#25252A] hover:bg-[#2E2E32] flex items-center justify-center transition-colors">
                              <Play size={20} className="text-white ml-0.5" fill="white" weight="fill" />
                            </div>
                          </Link>
                        </li>
                      ))}
                      {m.courses.length === 0 ? (
                        <li className="text-sm text-white/40">
                          Nenhum curso vinculado.
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="">
                    <div className="mt-3 space-y-2">
                      {m.exams.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between gap-4 p-4 bg-gray-gradient rounded-[16px] border border-[#25252A] transition-opacity"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">
                              {e.title}
                            </div>
                            <div className="text-xs text-white/50">
                              Nota mínima: {e.passingScore}%
                            </div>
                          </div>
                          <Button
                            asChild
                            className="h-10 rounded-full bg-blue-gradient-500 px-5 text-sm font-semibold hover:shadow-[0_0_12px_#00C8FF] transition-all"
                          >
                            <Link href={`/learn/careers/${data.career.slug}/exams/${e.id}`}>
                              Fazer teste
                            </Link>
                          </Button>
                        </div>
                      ))}
                      {m.exams.length === 0 ? (
                        <div className="text-sm text-white/40">
                          Nenhum exame cadastrado.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coluna direita (sidebar) */}
          <div className="lg:sticky lg:top-6">
            <Card className="">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2 pt-2">
                  <EnrollCareerButton
                    careerId={data.career.id}
                    isEnrolled={data.enrollment.isEnrolled}
                    notEnrolledLabel="Iniciar"
                    enrolledLabel="Inscrito"
                    className="w-full bg-blue-gradient-500 h-[54px] rounded-full hover:shadow-[0_0_12px_#00C8FF] transition-all"
                  />

                  <Button
                    variant="secondary"
                    className="w-full rounded-md h-[54px] bg-transparent hover:bg-white/10 text-white"
                    asChild
                  >
                    <Link href="#modulos">Ver conteúdos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

