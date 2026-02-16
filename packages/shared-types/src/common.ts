export type { Role, CertificateTemplate } from "@prisma/client";

export interface Address {
    id: string;
    userId: string;
    country: string | null;
    foreign_country: boolean;
    postal_code: string | null;
    street_name: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    foreign_address: string | null;
}
