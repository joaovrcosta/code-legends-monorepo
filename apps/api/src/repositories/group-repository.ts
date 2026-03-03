import { Submodule } from "@prisma/client";

interface CreateGroupData {
  title: string;
  moduleId: string;
}

interface UpdateGroupData {
  title?: string;
}

export interface IGroupRepository {
  create(data: CreateGroupData): Promise<Submodule>;
  findAll(moduleId?: string): Promise<Submodule[]>;
  findById(id: number): Promise<Submodule | null>;
  findByTitleAndModuleId(
    title: string,
    moduleId: string
  ): Promise<Submodule | null>;
  update(id: number, data: UpdateGroupData): Promise<Submodule>;
  delete(id: number): Promise<void>;
}
