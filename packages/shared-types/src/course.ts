import type { UserPublicDTO } from "./user";

export interface CategoryDTO {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
}

export interface CourseDTO {
    id: string;
    title: string;
    slug: string;
    active: boolean;
    thumbnail: string | null;
    colorHex: string | null;
    createdAt: Date;
    updatedAt: Date;
    releaseAt: Date | null;
    isFree: boolean;
    subscriptions: number;
    level: string;
    icon: string | null;
    tags: string[];
    description: string;
    instructorId: string;
    categoryId: string | null;
    instructor?: UserPublicDTO;
    category?: CategoryDTO | null;
    totalDuration?: string | null; // Duração total do curso em formato legível (ex: "19h 30min")
    _count?: {
        userCourses: number;
    };
}
