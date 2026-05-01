import { getCareerBySlug } from "@/actions/career";
import { EnrollCareerButton } from "@/components/career/enroll-career-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/classroom/module-progress-ring";
import { getAuroraBackground } from "@/utils/hexToRgb";
import { CaretLeftIcon, Check, FlaskIcon, Lock, Play } from "@phosphor-icons/react/dist/ssr";
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
            <Link
              href="/learn/careers"
              className="group p-2 lg:bg-transparent relative lg:top-0 top-[12px] bg-white/5 rounded-lg flex items-center gap-2 mb-4 text-[#7e7e89] transition-colors duration-200 hover:bg-black/20 hover:text-[#e0e0e8] self-start mr-auto"
            >
              <span className="inline-flex shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1 group-active:-translate-x-0.5">
                <CaretLeftIcon size={24} weight="bold" />
              </span>
              <span className="text-xs lg:block hidden uppercase tracking-wider">
                Voltar
              </span>
            </Link>

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
                <div className="mb-2 mt-6">
                  <EnrollCareerButton
                    careerId={data.career.id}
                    isEnrolled={data.enrollment.isEnrolled}
                    notEnrolledLabel="Iniciar"
                    enrolledLabel="Inscrito"
                    className="h-12 w-full lg:max-w-[142px] rounded-full px-4 text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1420px] flex-col items-start mt-6">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:px-0 px-4">
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
                              <div className="flex items-center justify-between gap-3">
                                <div className="truncate text-sm font-medium text-white/90">
                                  {c.title}
                                </div>
                                <ProgressRing
                                  progress={Math.max(0, Math.min(1, c.progress / 100))}
                                  moduleNumber={0}
                                  size={34}
                                  strokeWidth={2.5}
                                  progressColor="stroke-[#00C8FF]"
                                  trackColor="stroke-[#25252A]"
                                  padModuleNumber={false}
                                  centerLabel={`${Math.round(c.progress)}%`}
                                />
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
                          className="flex flex-col gap-4 px-4 py-5 rounded-[16px] bg-[#101013] border border-[#25252A] transition-opacity sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <FlaskIcon
                                size={20}
                                className="text-white"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white leading-snug line-clamp-2 sm:line-clamp-1">
                                {e.title}
                                {e.passed ? (
                                  <span className="ml-2 inline-flex align-middle opacity-70">
                                    <Check size={14} weight="bold" className="text-emerald-200" />
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-xs text-white/50">
                                Nota mínima: {e.passingScore}%
                              </div>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto sm:shrink-0">
                            {data.enrollment.isEnrolled ? (
                              <Button
                                asChild
                                className="h-10 w-full sm:w-auto rounded-full px-5 text-sm font-semibold bg-transparent hover:bg-white/5 text-white/80 transition-all"
                              >
                                <Link href={`/learn/careers/${data.career.slug}/exams/${e.id}`}>
                                  {e.passed ? "Refazer prova" : "Fazer teste"}
                                </Link>
                              </Button>
                            ) : (
                              <div
                                className="flex h-10 w-full min-h-10 min-w-0 sm:w-auto sm:min-w-[120px] shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#25252A] bg-white/[0.04] text-white/45"
                                title="Inscreva-se na carreira para fazer o teste"
                                aria-label="Exame bloqueado: inscreva-se na carreira para fazer o teste"
                              >
                                <Lock size={22} weight="bold" className="text-white/55" />
                              </div>
                            )}
                          </div>
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

          <div className="lg:sticky lg:top-6">
            <div className="space-y-4">
              <Card className="">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2 pt-2">
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

              <Card className="">
                <CardContent className="p-5">
                  <div className="text-sm font-semibold text-white/80">
                    Certificado
                  </div>
                  <div className="mt-3 relative overflow-hidden rounded-[20px] border border-[#25252A]">
                    <Image
                      src="/certificate-image.png"
                      alt="Certificado"
                      width={500}
                      height={120}
                      className="h-[120px] w-full object-cover opacity-80"
                    />

                    {data.enrollment.isCompleted ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          asChild
                          className="h-10 rounded-full bg-[#00C8FF] hover:bg-[#00a8d4] text-black font-semibold"
                        >
                          <Link href="/account/certificates">Ver certificado</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center gap-2">
                        <Lock size={20} className="text-white" />
                        <span className="text-white text-sm font-semibold">
                          Bloqueado
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-white/55">
                    Conclua 100% da carreira para liberar o certificado.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

