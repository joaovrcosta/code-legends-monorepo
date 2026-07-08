import { CertificateCard } from "@/components/account/certificate-card";
import { CompletedCourseCertificateRow } from "@/components/account/completed-course-certificate-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getUserCertificates } from "@/actions/user/get-user-certificates";
import { getCompletedCourses } from "@/actions/course/completed";
import type { CompletedCourse } from "@/types/user-course.ts";
import { Medal } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountCertificatesPage() {
  const certificates = await getUserCertificates();
  const completedCourses = await getCompletedCourses();
  const completedCoursesList = completedCourses.courses || [];

  const issuedCourseIds = new Set(
    certificates
      .map((certificate) => certificate.course?.id)
      .filter((id): id is string => Boolean(id)),
  );

  const pendingCertificateCourses = completedCoursesList.filter(
    (course) => !issuedCourseIds.has(course.id),
  );

  const courseIconById = new Map(
    completedCoursesList
      .filter((course) => course.icon)
      .map((course) => [course.id, course.icon]),
  );

  function resolveCertificateIcon(certificate: (typeof certificates)[number]) {
    if (certificate.career?.icon) return certificate.career.icon;
    const courseId = certificate.course?.id;
    if (courseId && courseIconById.has(courseId)) {
      return courseIconById.get(courseId) ?? null;
    }
    return certificate.course?.icon ?? null;
  }

  function toModalCourse(
    certificate: (typeof certificates)[number],
  ): CompletedCourse {
    const title = certificate.career?.title
      ? `Carreira: ${certificate.career.title}`
      : (certificate.course?.title ?? "Certificado");

    const completedAt =
      typeof certificate.createdAt === "string"
        ? certificate.createdAt
        : certificate.createdAt.toISOString();

    return {
      id: certificate.course?.id ?? certificate.career?.id ?? certificate.id,
      certificateId: certificate.id,
      title,
      icon: resolveCertificateIcon(certificate) ?? "",
      progress: 1,
      completedAt,
    };
  }

  function formatStatusLabel(completedAt?: Date | string | null): string {
    if (!completedAt) return "Concluído";
    const date = new Date(completedAt);
    if (Number.isNaN(date.getTime())) return "Concluído";
    return `Concluído em ${date.toLocaleDateString("pt-BR")}`;
  }

  const hasCertificates = certificates.length > 0;
  const hasPendingCourses = pendingCertificateCourses.length > 0;

  return (
    <div className="w-full space-y-4">
      <Card className="rounded-[20px] border-[#25252a] bg-primary py-6 lg:px-6 lg:pt-6">
        <CardHeader className="mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-white">
              Meus Certificados
            </h1>
          </div>
          <p className="text-sm text-muted">
            Visualize e gerencie todos os seus certificados conquistados.
          </p>
        </CardHeader>

        <CardContent className="space-y-3 px-0">
          {hasCertificates || hasPendingCourses ? (
            <>
              {certificates
                .filter((certificate) => Boolean(certificate?.id))
                .map((certificate) => {
                  const modalCourse = toModalCourse(certificate);
                  return (
                    <CertificateCard
                      key={certificate.id}
                      course={modalCourse}
                      statusLabel={formatStatusLabel(certificate.createdAt)}
                    />
                  );
                })}

              {pendingCertificateCourses.map((course) => (
                <CompletedCourseCertificateRow key={course.id} course={course} />
              ))}
            </>
          ) : (
            <div className="py-12 text-center">
              <Medal className="mx-auto mb-4 h-16 w-16 text-muted" />
              <p className="mb-2 text-lg text-muted">
                Você ainda não possui certificados
              </p>
              <p className="mb-4 text-sm text-muted">
                Complete seus cursos para ganhar certificados incríveis!
              </p>
              <Link
                href="/learn/catalog"
                className="inline-block text-sm text-[#00c8ff] hover:underline"
              >
                Explorar cursos disponíveis
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
