import { CourseStatus } from "@prisma/client"
import { prisma } from "../../../lib/prisma"
import { ICourseRepository } from "../../../repositories/course-repository"
import {
  ICourseSkillRepository,
  type SkillConfigItem,
} from "../../../repositories/course-skill-repository"
import { CourseNotFoundError } from "../../errors/course-not-found"

export class GetCourseSkillsConfigUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private courseSkillRepository: ICourseSkillRepository,
  ) { }

  /**
   * @param options.allowUnpublished — true só na rota autenticada `/skills-config/editor`.
   * @param options.mergeLessonSkills — default true: inclui skills configuradas por aula na lista
   *   (união com CourseSkill). Use false no editor do Content Hub para listar só CourseSkill
   *   e não esconder skills lesson-only do select de outras aulas.
   */
  async execute(
    courseId: string,
    options: { allowUnpublished?: boolean; mergeLessonSkills?: boolean } = {},
  ) {
    const allowUnpublished = options.allowUnpublished === true
    const mergeLessonSkills = options.mergeLessonSkills !== false

    const course = await this.courseRepository.findById(courseId)
    if (!course) throw new CourseNotFoundError()

    if (
      !allowUnpublished &&
      course.status !== CourseStatus.PUBLISHED
    ) {
      throw new CourseNotFoundError()
    }

    const courseSkills =
      await this.courseSkillRepository.listConfigByCourseId(courseId)

    if (!mergeLessonSkills) {
      const skills = [...courseSkills].sort((a, b) => b.weight - a.weight)
      return { courseId, skills }
    }

    const lessonSkillRows = await prisma.lessonSkill.findMany({
      where: {
        lesson: {
          submodule: {
            module: { courseId },
          },
        },
      },
      select: {
        skillId: true,
        weight: true,
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    })

    const bySkillId = new Map<string, SkillConfigItem>()

    for (const cs of courseSkills) {
      bySkillId.set(cs.skillId, { ...cs })
    }

    for (const row of lessonSkillRows) {
      const existing = bySkillId.get(row.skillId)
      const fromLesson: SkillConfigItem = {
        skillId: row.skillId,
        name: row.skill.name,
        slug: row.skill.slug,
        description: row.skill.description,
        weight: row.weight,
      }
      if (!existing) {
        bySkillId.set(row.skillId, fromLesson)
      } else {
        existing.weight = Math.max(existing.weight, row.weight)
      }
    }

    const skills = [...bySkillId.values()].sort((a, b) => b.weight - a.weight)

    return { courseId, skills }
  }
}

