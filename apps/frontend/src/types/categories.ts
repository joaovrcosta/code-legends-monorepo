import type { CategoryDTO } from "@code-legends/shared-types";

export type { CategoryDTO } from "@code-legends/shared-types";

export type Category = CategoryDTO & {
  description?: string;
  order?: number;
  active?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export interface CategoriesResponse {
  categories: Category[];
}
