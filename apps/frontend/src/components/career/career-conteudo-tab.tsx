import { CareerExamAttemptHistory } from "@/components/career/career-exam-attempt-history";
import { CareerLockedPadlockPill } from "@/components/career/career-locked-padlock-pill";
import { ProgressRing } from "@/components/classroom/module-progress-ring";
import { Button } from "@/components/ui/button";
import type { GetCareerBySlugResponse } from "@/types/career";
import { Check, FlaskIcon, Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export function CareerConteudoTab({
  data,
}: {
  data: GetCareerBySlugResponse;
}) {
  return (
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
                          <CareerLockedPadlockPill
                            title="Inscreva-se na carreira para fazer o teste"
                            aria-label="Exame bloqueado: inscreva-se na carreira para fazer o teste"
                          />
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
  );
}
