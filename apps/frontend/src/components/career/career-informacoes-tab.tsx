import type { GetCareerBySlugResponse } from "@/types/career";

export function CareerInformacoesTab({
  data,
}: {
  data: GetCareerBySlugResponse;
}) {
  const totalCourses = data.modules.reduce((n, m) => n + m.courses.length, 0);
  const totalExams = data.modules.reduce((n, m) => n + m.exams.length, 0);

  return (
    <div className="space-y-6 rounded-2xl border border-[#25252A] bg-primary/30 px-5 py-6 sm:px-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Sobre esta carreira</h2>
        {data.career.description ? (
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            {data.career.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-white/45">
            Esta carreira ainda não possui descrição detalhada.
          </p>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#25252A] bg-[#0D0D12] px-4 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            Módulos
          </dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {data.modules.length}
          </dd>
        </div>
        <div className="rounded-xl border border-[#25252A] bg-[#0D0D12] px-4 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            Cursos
          </dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {totalCourses}
          </dd>
        </div>
        <div className="rounded-xl border border-[#25252A] bg-[#0D0D12] px-4 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            Exames de módulo
          </dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {totalExams}
          </dd>
        </div>
        <div className="rounded-xl border border-[#25252A] bg-[#0D0D12] px-4 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            Inscrição
          </dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {data.enrollment.isEnrolled ? "Ativa" : "Não inscrito"}
          </dd>
        </div>
        <div className="rounded-xl border border-[#25252A] bg-[#0D0D12] px-4 py-3 sm:col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            Progresso geral
          </dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {Math.round(data.enrollment.progress)}%
          </dd>
        </div>
      </dl>

      <div className="border-t border-[#25252A] pt-6">
        <h3 className="text-sm font-semibold text-white">Certificação</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Conclua os cursos e os exames de cada módulo para avançar no caminho.
          Quando estiver elegível, use o painel à direita para agendar o exame
          final e emitir o certificado, conforme as regras da plataforma.
        </p>
      </div>
    </div>
  );
}
