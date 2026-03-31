import { prisma } from "../../lib/prisma"
import {
  ILessonSkillRepository,
  SkillConfigItem,
} from "../lesson-skill-repository"

export class PrismaLessonSkillRepository implements ILessonSkillRepository {
  async listConfigByLessonId(lessonId: number): Promise<SkillConfigItem[]> {
    const lessonSkills = await prisma.lessonSkill.findMany({
      where: { lessonId },
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

    return lessonSkills.map((ls) => ({
      skillId: ls.skillId,
      name: ls.skill.name,
      slug: ls.skill.slug,
      description: ls.skill.description,
      weight: ls.weight,
    }))
  }

  async replaceConfigForLesson(
    lessonId: number,
    skills: Array<{ skillId: string; weight: number }>,
  ): Promise<SkillConfigItem[]> {
    await prisma.$transaction(async (tx) => {
      await tx.lessonSkill.deleteMany({ where: { lessonId } })

      if (skills.length > 0) {
        await tx.lessonSkill.createMany({
          data: skills.map((item) => ({
            lessonId,
            skillId: item.skillId,
            weight: item.weight,
          })),
        })
      }
    })

    return this.listConfigByLessonId(lessonId)
  }
}

