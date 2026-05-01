import type { CertificateTemplate } from "./common";
import type { UserPublicDTO } from "./user";
import type { CourseDTO } from "./course";

export interface CertificateCareerSummaryDTO {
    id: string;
    title: string;
    slug: string;
}

export interface CertificatePublicDTO {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        name: string;
    };
    course: {
        id: string;
        title: string;
        slug: string;
        instructor: {
            name: string;
        };
    } | null;
    career: CertificateCareerSummaryDTO | null;
    template: CertificateTemplate | null;
}

export interface CertificatePrivateDTO {
    id: string;
    userId: string;
    courseId: string | null;
    careerId: string | null;
    templateId: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: UserPublicDTO;
    course: CourseDTO | null;
    career: CertificateCareerSummaryDTO | null;
    template: CertificateTemplate | null;
}
