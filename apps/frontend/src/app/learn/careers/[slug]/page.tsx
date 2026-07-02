import { getCareerBySlug } from "@/actions/career";
import { getResolvedUserPlan } from "@/actions/user/get-user-from-api";
import { isPremium } from "@/lib/user-plan";
import { EnrollCareerButton } from "@/components/career/enroll-career-button";
import { CareerCertificatePanel } from "@/components/career/career-certificate-panel";
import { CareerConteudoTab } from "@/components/career/career-conteudo-tab";
import { CareerDetailTabs } from "@/components/career/career-detail-tabs";
import { CareerInformacoesTab } from "@/components/career/career-informacoes-tab";
import { Progress } from "@/components/ui/progress";
import { getAuroraBackground } from "@/utils/hexToRgb";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { FreeUserPremiumUpsellBadge } from "@/components/ui/subscriber-badge";
import Link from "next/link";
import { PageContentWidth } from "@/components/layout/page-container";
import { SectionTitle } from "@/app/catalog-courses-carousel-title";

export const dynamic = "force-dynamic";

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, userPlan] = await Promise.all([
    getCareerBySlug(slug),
    getResolvedUserPlan(),
  ]);
  const userIsPremium = isPremium(userPlan);

  return (
    <div className="w-full">
      <section
        className="relative w-full border-b border-[#25252A] pb-8 pt-6 lg:py-12"
        style={getAuroraBackground(data.career.colorHex)}
      >
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

        <PageContentWidth>
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

            <FreeUserPremiumUpsellBadge className="mt-3 mb-4" />
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
              </div>
            </div>
          </div>
        </PageContentWidth>
      </section>

      <PageContentWidth className="mt-6 flex flex-col items-start">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <CareerDetailTabs
            conteudo={
              <CareerConteudoTab data={data} isPremium={userIsPremium} />
            }
            informacoes={<CareerInformacoesTab data={data} />}
          />

          <div className="order-first lg:order-none lg:sticky lg:top-6">
            <div className="space-y-4">
              <EnrollCareerButton
                careerId={data.career.id}
                isEnrolled={data.enrollment.isEnrolled}
                notEnrolledLabel="Inscreva-se"
                enrolledLabel="Inscrito"
                className="my-4 h-12 w-full rounded-full bg-[#FF6200] px-4 text-base font-semibold text-white hover:bg-[#E55A00]"
              />
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
      </PageContentWidth>
    </div>
  );
}

