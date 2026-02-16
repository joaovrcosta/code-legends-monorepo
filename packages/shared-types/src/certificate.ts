import type { CertificateTemplate } from "./common";
import type { UserPublicDTO } from "./user";
import type { CourseDTO } from "./course";

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
    };
    template: CertificateTemplate | null;
}

export interface CertificatePrivateDTO {
    id: string;
    userId: string;
    courseId: string;
    templateId: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: UserPublicDTO;
    course: CourseDTO;
    template: CertificateTemplate | null;
}
