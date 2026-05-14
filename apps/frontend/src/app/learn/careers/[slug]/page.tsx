import { getCareerBySlug } from "@/actions/career";
import { EnrollCareerButton } from "@/components/career/enroll-career-button";
import { CareerCertificatePanel } from "@/components/career/career-certificate-panel";
import { CareerExamAttemptHistory } from "@/components/career/career-exam-attempt-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/classroom/module-progress-ring";
import { getAuroraBackground } from "@/utils/hexToRgb";
import { CaretLeftIcon, Check, FlaskIcon, LightningIcon, LightningSlashIcon, Lock, Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/app/catalog-courses-carousel-title";

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
        className="relative w-full border-b border-[#25252A] pb-8 pt-6 lg:py-12"
        style={getAuroraBackground(data.career.colorHex)}
      >
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

        <div className="mx-auto w-full max-w-[1420px] px-4 sm:px-6 lg:px-8 xl:px-12">
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

            {data.career.icon || data.career.thumbnail ? (
              <div className="mb-4 flex items-center justify-center lg:justify-start">
                {data.career.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.career.icon}
                    alt=""
                    width={140}
                    height={140}
                    className="relative right-0 object-contain lg:right-[12px]"
                  />
                ) : data.career.thumbnail ? (
                  <Image
                    src={data.career.thumbnail}
                    alt={data.career.title}
                    width={120}
                    height={120}
                    className="relative lg:right-[12px] right-0"
                  />
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center gap-1 my-4">
              <div className="text-xs flex gap-1 items-center font-semibold bg-premium-gradient text-white px-2 py-0.5 rounded-full">
                <span>PREMIUM</span>
                <LightningIcon
                  size={12}
                  className="text-white"
                  weight="fill"
                />
              </div>
            </div>
            <h1 className="font-bold lg:text-[44px] text-2xl lg:text-left leading-tight text-center mb-3 text-white">
              {data.career.title}
            </h1>

            {data.career.description ? (
              <p className="lg:text-base text-sm mt-1 text-center lg:text-left max-w-[620px] text-[#a5a5a6]">
                {data.career.description}
              </p>
            ) : null}

            <div className="mt-6 flex w-full justify-center lg:justify-start">
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
                    notEnrolledLabel="Inscreva-se"
                    enrolledLabel="Inscrito"
                    className="h-12 w-full lg:max-w-[142px] rounded-full px-4 text-base text-white font-semibold bg-blue-gradient-500 text-white/70 hover:bg-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 flex w-full max-w-[1420px] flex-col items-start px-4 sm:px-6 lg:px-8 xl:px-12">
        <SectionTitle
          className="mb-4"
          title="Curriculo do caminho"
        />
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div id="modulos" className="min-w-0 space-y-4">
            {data.modules.map((m) => (
              <div
                key={m.id}
                className="w-full rounded-2xl py-4"
              >
                <div className="flex items-start justify-between gap-4 sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg">
                      {m.title}
                    </span>
                    {m.description ? (
                      <p className="mt-1 text-sm text-white/60">{m.description}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0 text-right">
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
                    <ul className="mt-3 space-y-5">
                      {m.courses.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <ProgressRing
                              progress={Math.max(0, Math.min(1, c.progress / 100))}
                              moduleNumber={0}
                              size={34}
                              strokeWidth={2}
                              progressColor="stroke-[#00C8FF]"
                              trackColor="stroke-[#25252A]"
                              padModuleNumber={false}
                              centerLabel={`${Math.round(c.progress)}%`}
                            />
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
                                <div className="truncate text-base font-medium text-white/90">
                                  {c.title}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/learn/paths/${c.slug}`}
                            className="shrink-0 text-xs font-semibold text-[#00C8FF]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25252A] transition-colors hover:bg-[#2E2E32]">
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
                          className="flex flex-col gap-3 rounded-[20px] border border-[#25252A] bg-primary px-4 py-5 transition-opacity sm:px-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                            <div className="flex min-w-0 flex-1 items-center gap-4">
                              <div>
                                <FlaskIcon
                                  size={20}
                                  className="text-[#a7f3d7]"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] text-white/50 mb-2 tracking-widest">
                                  <p className="text-muted-foreground text-[10px] font-light mb-1">Exame de certificação
                                  </p>
                                </div>
                                <div className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 sm:line-clamp-1">
                                  {e.title}
                                  {e.passed ? (
                                    <span className="ml-2 inline-flex align-middle opacity-70">
                                      <Check size={14} weight="bold" className="text-emerald-200" />
                                    </span>
                                  ) : null}
                                </div>
                                {e.bestScore != null ? (
                                  <div className="mt-1 text-[11px] text-white/45">
                                    Melhor nota: {Math.round(e.bestScore)}%
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="w-full shrink-0 sm:w-auto sm:self-center">
                              {data.enrollment.isEnrolled ? (
                                <Button
                                  asChild
                                  className="h-10 w-full rounded-full bg-transparent px-5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 sm:min-w-[10rem] sm:w-auto"
                                >
                                  <Link href={`/learn/careers/${data.career.slug}/exams/${e.id}`}>
                                    {e.passed ? "Refazer prova" : "Fazer teste"}
                                  </Link>
                                </Button>
                              ) : (
                                <div
                                  className="flex h-10 w-full min-h-10 min-w-0 sm:w-auto sm:min-w-[120px] shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-[#18181f] text-white/45"
                                  title="Inscreva-se na carreira para fazer o teste"
                                  aria-label="Exame bloqueado: inscreva-se na carreira para fazer o teste"
                                >
                                  <Lock size={22} weight="bold" className="text-white/55" />
                                </div>
                              )}
                            </div>
                          </div>
                          <CareerExamAttemptHistory
                            careerSlug={data.career.slug}
                            examId={e.id}
                            attemptCount={e.attemptCount}
                          />
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
              <SectionTitle
                className=""
                title="Certificado"
              />
              <div className="mt-3">
                <CareerCertificatePanel
                  careerId={data.career.id}
                  careerSlug={data.career.slug}
                  careerTitle={data.career.title}
                  enrollment={data.enrollment}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

