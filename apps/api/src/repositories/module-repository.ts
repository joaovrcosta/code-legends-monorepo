import { Module } from "@prisma/client";

interface CreateModuleData {
  title: string;
  slug: string;
  courseId: string;
}

interface UpdateModuleData {
  title?: string;
  slug?: string;
}

export interface IModuleRepository {
  create(data: CreateModuleData): Promise<Module>;
  findAll(courseId?: string): Promise<Module[]>;
  findById(id: string): Promise<Module | null>;
  findBySlug(slug: string): Promise<Module | null>;
  update(id: string, data: UpdateModuleData): Promise<Module>;
  delete(id: string): Promise<void>;
}
