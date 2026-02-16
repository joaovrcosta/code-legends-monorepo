import type {
  CertificatePublicDTO,
  CertificatePrivateDTO,
} from "@code-legends/shared-types";

export type { CertificatePublicDTO, CertificatePrivateDTO } from "@code-legends/shared-types";

export type Certificate = Omit<CertificatePrivateDTO, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt?: string | Date;
};

export type CertificateResponse = Certificate[];

export interface CertificateVerifyResponse {
  certificate: Omit<CertificatePublicDTO, "createdAt" | "updatedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
    user: {
      name: string;
      email?: string;
    };
  };
  verified: boolean;
}