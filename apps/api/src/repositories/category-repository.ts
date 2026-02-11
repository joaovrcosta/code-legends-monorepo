import { Category } from "@prisma/client";

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

export interface ICategoryRepository {
  create(data: CreateCategoryData): Promise<Category>;
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}
