import { getCareerExam } from "@/actions/career";
import { CareerExamView } from "@/components/career/career-exam-view";

export const dynamic = "force-dynamic";

export default async function CareerExamPage({
  params,
}: {
  params: Promise<{ slug: string; examId: string }>;
}) {
  const { slug, examId } = await params;
  const { exam } = await getCareerExam({ careerIdentifier: slug, examId });

  return (
    <div className="w-full">
      <div className="flex flex-col items-start xl:mt-10 mt-6 px-4 lg:px-[84px]">
        <CareerExamView
          careerSlug={slug}
          onBackHref={`/learn/careers/${slug}`}
          exam={exam as any}
        />
      </div>
    </div>
  );
}

