import { GenerateCertificateButton } from "./generate-certificate-button";
import { CertificateListItem } from "./certificate-list-item";
import type { CompletedCourse } from "@/types/user-course.ts";

interface CompletedCourseCertificateRowProps {
  course: CompletedCourse;
}

function formatStatusLabel(completedAt?: Date | string | null): string {
  if (!completedAt) return "Concluído";
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return "Concluído";
  return `Concluído em ${date.toLocaleDateString("pt-BR")}`;
}

export function CompletedCourseCertificateRow({
  course,
}: CompletedCourseCertificateRowProps) {
  return (
    <CertificateListItem
      title={course.title}
      iconUrl={course.icon}
      statusLabel={formatStatusLabel(course.completedAt)}
      action={
        <GenerateCertificateButton courseId={course.id} course={course} />
      }
    />
  );
}
