import { prisma } from "../../lib/prisma"
import {
  ICourseSkillRepository,
  SkillConfigItem,
} from "../course-skill-repository"

export class PrismaCourseSkillRepository implements ICourseSkillRepository {
  async listConfigByCourseId(courseId: string): Promise<SkillConfigItem[]> {
    const courseSkills = await prisma.courseSkill.findMany({
      where: { courseId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
      orderBy: { weight: "desc" },
    })

    return courseSkills.map((cs) => ({
      skillId: cs.skillId,
      name: cs.skill.name,
      slug: cs.skill.slug,
      description: cs.skill.description,
      weight: cs.weight,
    }))
  }

  async replaceConfigForCourse(
    courseId: string,
    skills: Array<{ skillId: string; weight: number }>,
  ): Promise<SkillConfigItem[]> {
    await prisma.$transaction(async (tx) => {
      await tx.courseSkill.deleteMany({ where: { courseId } })

      if (skills.length > 0) {
        await tx.courseSkill.createMany({
          data: skills.map((item) => ({
            courseId,
            skillId: item.skillId,
            weight: item.weight,
          })),
        })
      }
    })

    return this.listConfigByCourseId(courseId)
  }

  async findCourseSkillIdsIn(
    courseId: string,
    skillIds: string[],
  ): Promise<string[]> {
    if (skillIds.length === 0) return []

    const rows = await prisma.courseSkill.findMany({
      where: { courseId, skillId: { in: skillIds } },
      select: { skillId: true },
    })

    return rows.map((row) => row.skillId)
  }
}

