import { getCareerExam } from "@/actions/career";
import { CareerExamPageClient } from "@/components/career/career-exam-page-client";

export const dynamic = "force-dynamic";

export default async function CareerExamPage({
  params,
}: {
  params: Promise<{ slug: string; examId: string }>;
}) {
  const { slug, examId } = await params;
  const payload = await getCareerExam({ careerIdentifier: slug, examId });

  return (
    <div className="w-full">
      <CareerExamPageClient careerSlug={slug} payload={payload} />
    </div>
  );
}

