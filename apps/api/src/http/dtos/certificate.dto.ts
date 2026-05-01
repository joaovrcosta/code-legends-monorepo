import { Certificate, Course, User, CertificateTemplate, Category, Career } from "@prisma/client";
import type {
  CertificatePublicDTO,
  CertificatePrivateDTO,
  UserPublicDTO,
  CourseDTO,
  CertificateCareerSummaryDTO,
} from "@code-legends/shared-types";
import { toUserPublicDTO } from "./user.dto";
import { toCourseDTO } from "./course.dto";

export type {
  CertificatePublicDTO,
  CertificatePrivateDTO,
} from "@code-legends/shared-types";

function toCareerSummaryDTO(
  career: Pick<Career, "id" | "title" | "slug"> | null | undefined
): CertificateCareerSummaryDTO | null {
  if (!career) return null;
  return {
    id: career.id,
    title: career.title,
    slug: career.slug,
  };
}

export function toCertificatePublicDTO(
  certificate: Certificate & {
    user?: User;
    course?:
      | (Course & {
          instructor?: User;
        })
      | null;
    career?: Pick<Career, "id" | "title" | "slug"> | null;
    template?: CertificateTemplate | null;
  }
): CertificatePublicDTO {
  const careerDto = toCareerSummaryDTO(certificate.career ?? null);
  const hasCourse = Boolean(certificate.course?.id);

  return {
    id: certificate.id,
    createdAt: certificate.createdAt,
    updatedAt: certificate.updatedAt,
    user: {
      name: certificate.user?.name || "",
    },
    course: hasCourse
      ? {
          id: certificate.course!.id,
          title: certificate.course!.title,
          slug: certificate.course!.slug,
          instructor: {
            name: certificate.course!.instructor?.name || "",
          },
        }
      : null,
    career: careerDto,
    template: certificate.template || null,
  };
}

export function toCertificatePrivateDTO(
  certificate: Certificate & {
    user?: User;
    course?:
      | (Course & {
          instructor?: User;
          category?: Category | null;
        })
      | null;
    career?: Pick<Career, "id" | "title" | "slug"> | null;
    template?: CertificateTemplate | null;
  }
): CertificatePrivateDTO {
  return {
    id: certificate.id,
    userId: certificate.userId,
    courseId: certificate.courseId,
    careerId: certificate.careerId,
    templateId: certificate.templateId,
    createdAt: certificate.createdAt,
    updatedAt: certificate.updatedAt,
    user: certificate.user ? toUserPublicDTO(certificate.user) : ({} as UserPublicDTO),
    course: certificate.course ? toCourseDTO(certificate.course) : null,
    career: toCareerSummaryDTO(certificate.career ?? null),
    template: certificate.template || null,
  };
}
