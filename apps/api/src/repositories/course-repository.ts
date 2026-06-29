import { Course, CourseKind } from "@prisma/client";

interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  level: string;
  instructorId: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: Date | null;
  kind?: CourseKind;
  exclusiveCareerId?: string | null;
}

interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: Date | null;
}

interface FindAllFilters {
  categoryId?: string;
  instructorId?: string;
  search?: string;
  includeDrafts?: boolean;
  /** Admin: cursos elegíveis para vincular a um módulo de carreira */
  forCareerId?: string;
  kind?: CourseKind;
}

export interface ICourseRepository {
  create(data: CreateCourseData): Promise<Course>;
  findAll(filters?: FindAllFilters): Promise<Course[]>;
  findRecent(limit?: number): Promise<Course[]>;
  findPopular(limit?: number): Promise<Course[]>;
  findById(id: string): Promise<Course | null>;
  findBySlug(slug: string): Promise<Course | null>;
  searchByName(name: string): Promise<Course[]>;
  update(id: string, data: UpdateCourseData): Promise<Course>;
  delete(id: string): Promise<void>;
  publish(id: string): Promise<Course>;
  unpublish(id: string): Promise<Course>;
}
