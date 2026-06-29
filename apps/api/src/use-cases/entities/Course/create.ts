import { Course, CourseKind } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { ICategoryRepository } from "../../../repositories/category-repository";
import { ICareerRepository } from "../../../repositories/career-repository";
import { CourseAlreadyExistsError } from "../../errors/course-already-exists";
import { InstructorNotFoundError } from "../../errors/instructor-not-found";
import { CategoryNotFoundError } from "../../errors/category-not-found";

interface CreateCourseRequest {
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

interface CreateCourseResponse {
  course: Course;
}

export class CreateCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository,
    private categoryRepository: ICategoryRepository,
    private careerRepository: ICareerRepository
  ) { }

  async execute(data: CreateCourseRequest): Promise<CreateCourseResponse> {
    const courseWithSameSlug = await this.courseRepository.findBySlug(
      data.slug
    );

    if (courseWithSameSlug) {
      throw new CourseAlreadyExistsError();
    }

    const instructor = await this.usersRepository.findById(data.instructorId);

    if (!instructor) {
      throw new InstructorNotFoundError();
    }

    // Validar se o usuário tem role de INSTRUCTOR ou ADMIN
    if (instructor.role !== "INSTRUCTOR" && instructor.role !== "ADMIN") {
      throw new Error("User is not an instructor or admin");
    }

    // Validar categoria (se fornecida)
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new CategoryNotFoundError();
      }
    }

    const kind = data.kind ?? "CATALOG";

    if (kind === "PATH_UNIT") {
      if (!data.exclusiveCareerId) {
        throw new Error("exclusiveCareerId is required for PATH_UNIT courses");
      }
      const career = await this.careerRepository.findById(data.exclusiveCareerId);
      if (!career) {
        throw new Error("Career not found");
      }
      if (!career.active) {
        throw new Error("Career is not active");
      }
    } else if (data.exclusiveCareerId) {
      throw new Error("exclusiveCareerId is only allowed for PATH_UNIT courses");
    }

    const course = await this.courseRepository.create({
      ...data,
      kind,
      exclusiveCareerId: kind === "PATH_UNIT" ? data.exclusiveCareerId : null,
    });

    return {
      course,
    };
  }
}
