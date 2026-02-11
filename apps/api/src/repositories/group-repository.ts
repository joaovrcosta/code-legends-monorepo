import { Group } from "@prisma/client";

interface CreateGroupData {
  title: string;
  moduleId: string;
}

interface UpdateGroupData {
  title?: string;
}

export interface IGroupRepository {
  create(data: CreateGroupData): Promise<Group>;
  findAll(moduleId?: string): Promise<Group[]>;
  findById(id: number): Promise<Group | null>;
  findByTitleAndModuleId(
    title: string,
    moduleId: string
  ): Promise<Group | null>;
  update(id: number, data: UpdateGroupData): Promise<Group>;
  delete(id: number): Promise<void>;
}
