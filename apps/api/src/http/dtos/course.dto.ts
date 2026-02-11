import { Course, Category, User } from "@prisma/client";
import { UserPublicDTO, toUserPublicDTO } from "./user.dto";

/**
 * DTO para Course com relações básicas
 */
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
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  _count?: {
    userCourses: number;
  };
}

/**
 * Converte Course do Prisma para DTO
 */
export function toCourseDTO(
  course: Course & {
    instructor?: User;
    category?: Category | null;
    _count?: {
      userCourses: number;
    };
  }
): CourseDTO {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    active: course.active,
    thumbnail: course.thumbnail,
    colorHex: course.colorHex,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    releaseAt: course.releaseAt,
    isFree: course.isFree,
    subscriptions: course.subscriptions,
    level: course.level,
    icon: course.icon,
    tags: course.tags,
    description: course.description,
    instructorId: course.instructorId,
    categoryId: course.categoryId,
    instructor: course.instructor ? toUserPublicDTO(course.instructor) : undefined,
    category: course.category
      ? {
          id: course.category.id,
          name: course.category.name,
          slug: course.category.slug,
          color: course.category.color,
          icon: course.category.icon,
        }
      : null,
    _count: course._count,
  };
}

