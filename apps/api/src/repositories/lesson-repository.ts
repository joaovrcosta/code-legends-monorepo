import { Lesson } from "@prisma/client";

interface CreateLessonData {
  title: string;
  description: string;
  type: string;
  slug: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  locked?: boolean;
  submoduleId: number;
  order?: number;
  authorId: string;
}

interface UpdateLessonData {
  title?: string;
  description?: string;
  type?: string;
  slug?: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  locked?: boolean;
  order?: number;
}

export interface ILessonRepository {
  create(data: CreateLessonData): Promise<Lesson>;
  findAll(groupId?: number): Promise<Lesson[]>;
  findById(id: number): Promise<Lesson | null>;
  findBySlug(slug: string): Promise<Lesson | null>;
  findByCourseIdAndSlug(courseId: string, slug: string): Promise<Lesson | null>;
  findBySlugAndSubmoduleId(slug: string, submoduleId: number): Promise<Lesson | null>;
  update(id: number, data: UpdateLessonData): Promise<Lesson>;
  delete(id: number): Promise<void>;
}
