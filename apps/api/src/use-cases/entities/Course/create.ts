import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { ICategoryRepository } from "../../../repositories/category-repository";
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
}

interface CreateCourseResponse {
  course: Course;
}

export class CreateCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(data: CreateCourseRequest): Promise<CreateCourseResponse> {
    // Verificar se o curso já existe
    const courseWithSameSlug = await this.courseRepository.findBySlug(
      data.slug
    );

    if (courseWithSameSlug) {
      throw new CourseAlreadyExistsError();
    }

    // Verificar se o instrutor existe
    const instructor = await this.usersRepository.findById(data.instructorId);

    console.log("instructor", instructor);

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

    const course = await this.courseRepository.create(data);

    return {
      course,
    };
  }
}
