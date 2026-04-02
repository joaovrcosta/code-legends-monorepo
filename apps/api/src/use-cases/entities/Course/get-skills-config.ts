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
   */
  async execute(
    courseId: string,
    options: { allowUnpublished?: boolean } = {},
  ) {
    const allowUnpublished = options.allowUnpublished === true

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

