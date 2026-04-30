import { getCareerBySlug } from "@/actions/career";
import { EnrollCareerButton } from "@/components/career/enroll-career-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  const firstExam = data.modules.find((m) => m.exams.length > 0)?.exams[0] ?? null;
  const firstExamHref = firstExam
    ? `/learn/careers/${data.career.slug}/exams/${firstExam.id}`
    : null;

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1420px] flex-col items-start xl:mt-10 mt-6 px-4">
        {/* Header (full-width) */}
        <div className="flex w-full flex-col gap-3 rounded-2xl py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-bold lg:text-[44px] text-2xl lg:text-left leading-tight text-center mb-4">
                {data.career.title}
              </h1>
              {data.career.description ? (
                <p className="mt-1 text-sm text-white/70">{data.career.description}</p>
              ) : null}
            </div>
            <EnrollCareerButton
              careerId={data.career.id}
              isEnrolled={data.enrollment.isEnrolled}
            />
          </div>
        </div>

        {/* Conteúdo em 2 colunas */}
        <div className="mt-2 grid w-full grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Coluna esquerda: módulos */}
          <div id="modulos" className="min-w-0 space-y-4">
            {data.modules.map((m) => (
              <div
                key={m.id}
                className="w-full rounded-2xl py-4 px-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white">{m.title}</h2>
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
                            className="text-xs font-semibold text-[#00C8FF]"
                          >
                            Abrir
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
                        <Link
                          key={e.id}
                          href={`/learn/careers/${data.career.slug}/exams/${e.id}`}
                          className="flex items-center justify-between rounded-xl px-3 py-3 hover:border-[#3f3f48]"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">
                              {e.title}
                            </div>
                            <div className="text-xs text-white/50">
                              Nota mínima: {e.passingScore}%
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#00C8FF]">
                            Fazer
                          </span>
                        </Link>
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
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white/80">
                    Progresso geral
                  </div>
                  <div className="text-xs font-semibold text-white/60">
                    {data.enrollment.progress}%
                  </div>
                </div>

                <Progress value={data.enrollment.progress} />

                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full bg-blue-gradient-500 h-[54px] rounded-full"
                    disabled={!data.enrollment.isEnrolled || !firstExamHref}
                    asChild={Boolean(firstExamHref && data.enrollment.isEnrolled)}
                  >
                    {firstExamHref && data.enrollment.isEnrolled ? (
                      <Link href={firstExamHref}>Iniciar</Link>
                    ) : (
                      <span>Iniciar</span>
                    )}
                  </Button>

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

