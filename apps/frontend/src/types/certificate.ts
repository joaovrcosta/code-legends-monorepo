export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  completedAt: string | Date;
  createdAt: string | Date;
  course: {
    id: string;
    title: string;
    slug: string;
    icon?: string;
  };
}

export type CertificateResponse = Certificate[];

export interface CertificateVerifyResponse {
  certificate: {
    id: string;
    createdAt: string | Date;
    user: {
      name: string;
      email: string;
    };
    course: {
      id: string;
      title: string;
      slug: string;
      instructor: {
        name: string;
      };
    };
    template: string | null;
  };
  verified: boolean;
}