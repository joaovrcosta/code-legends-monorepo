import { Certificate, Course, User, CertificateTemplate, Category } from "@prisma/client";
import type {
  CertificatePublicDTO,
  CertificatePrivateDTO,
  UserPublicDTO,
  CourseDTO,
} from "@code-legends/shared-types";
import { toUserPublicDTO } from "./user.dto";
import { toCourseDTO } from "./course.dto";

export type {
  CertificatePublicDTO,
  CertificatePrivateDTO,
} from "@code-legends/shared-types";

export function toCertificatePublicDTO(
  certificate: Certificate & {
    user?: User;
    course?: Course & {
      instructor?: User;
    };
    template?: CertificateTemplate | null;
  }
): CertificatePublicDTO {
  return {
    id: certificate.id,
    createdAt: certificate.createdAt,
    updatedAt: certificate.updatedAt,
    user: {
      name: certificate.user?.name || "",
    },
    course: {
      id: certificate.course?.id || "",
      title: certificate.course?.title || "",
      slug: certificate.course?.slug || "",
      instructor: {
        name: certificate.course?.instructor?.name || "",
      },
    },
    template: certificate.template || null,
  };
}

export function toCertificatePrivateDTO(
  certificate: Certificate & {
    user?: User;
    course?: Course & {
      instructor?: User;
      category?: Category | null;
    };
    template?: CertificateTemplate | null;
  }
): CertificatePrivateDTO {
  return {
    id: certificate.id,
    userId: certificate.userId,
    courseId: certificate.courseId,
    templateId: certificate.templateId,
    createdAt: certificate.createdAt,
    updatedAt: certificate.updatedAt,
    user: certificate.user ? toUserPublicDTO(certificate.user) : ({} as UserPublicDTO),
    course: certificate.course ? toCourseDTO(certificate.course) : ({} as CourseDTO),
    template: certificate.template || null,
  };
}

