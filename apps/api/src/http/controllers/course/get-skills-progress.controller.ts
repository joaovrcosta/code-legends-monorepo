import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { canViewUserSkills } from '../../utils/skill-visibility'

export async function getSkillsProgress(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })
  const querySchema = z.object({
    moduleId: z.string().optional(),
    userId: z.string().optional(),
  })

  const { id: courseId } = paramsSchema.parse(request.params)
  const { moduleId, userId: requestedUserId } = querySchema.parse(request.query ?? {})
  const targetUserId = requestedUserId ?? request.user.id

  if (
    !canViewUserSkills({
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role,
      targetUserId,
    })
  ) {
    return reply.status(403).send({
      message: 'Forbidden Access: You are not authorized to access this resource',
    })
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true },
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    if (
      request.user.role === Role.STUDENT &&
      course.status !== 'PUBLISHED'
    ) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    const courseSkills = await prisma.courseSkill.findMany({
      where: { courseId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        weight: 'desc',
      },
    })

    if (moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: moduleId, courseId },
        include: {
          submodules: {
            include: {
              lessons: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { id: 'asc' },
          },
        },
      })

      if (module) {
        const moduleLessonIds = module.submodules.flatMap((s) =>
          s.lessons.map((l) => l.id),
        )

        const historyRows = await prisma.userSkillXpHistory.findMany({
          where: {
            userId: targetUserId,
            source: 'lesson_completed',
            sourceId: { in: moduleLessonIds },
          },
          select: { skillId: true, xpAmount: true },
        })

        const gainedBySkill = new Map<string, number>()
        for (const row of historyRows) {
          gainedBySkill.set(
            row.skillId,
            (gainedBySkill.get(row.skillId) ?? 0) + row.xpAmount,
          )
        }

        const weightByCourseSkill = new Map<string, number>(
          courseSkills.map((cs) => [cs.skillId, cs.weight]),
        )

        // Inclui skills do curso + skills que tiveram XP no módulo (ex.: skills associadas à lesson).
        const unionSkillIds = Array.from(
          new Set<string>([
            ...courseSkills.map((cs) => cs.skillId),
            ...gainedBySkill.keys(),
          ]),
        )

        if (unionSkillIds.length === 0) {
          return reply.status(200).send({
            courseId,
            skills: [],
            xpGainedInModule: 0,
            axisMax: 3000,
            topSkills: [],
          })
        }

        const [skillMeta, userSkills] = await Promise.all([
          prisma.skill.findMany({
            where: { id: { in: unionSkillIds } },
            select: { id: true, name: true, slug: true },
          }),
          prisma.userSkillXp.findMany({
            where: { userId: targetUserId, skillId: { in: unionSkillIds } },
            select: { skillId: true, xp: true },
          }),
        ])

        const metaById = new Map<string, { name: string; slug: string }>(
          skillMeta.map((s) => [s.id, { name: s.name, slug: s.slug }]),
        )

        const xpBySkill = new Map<string, number>()
        for (const us of userSkills) {
          xpBySkill.set(us.skillId, us.xp)
        }

        const baseSkills = unionSkillIds
          .map((skillId) => {
            const meta = metaById.get(skillId)
            return {
              skillId,
              name: meta?.name ?? skillId,
              slug: meta?.slug ?? skillId,
              weight: weightByCourseSkill.get(skillId) ?? 0,
              totalXp: xpBySkill.get(skillId) ?? 0,
            }
          })
          .filter((s) => Boolean(s.name))

        const enrichedSkills = baseSkills
          .map((s) => {
            const gainedXpInModule = gainedBySkill.get(s.skillId) ?? 0
            return {
              ...s,
              gainedXpInModule,
              previousXp: Math.max(0, s.totalXp - gainedXpInModule),
            }
          })
          .sort((a, b) => (b.gainedXpInModule ?? 0) - (a.gainedXpInModule ?? 0))

        const xpGainedInModule = enrichedSkills.reduce(
          (sum, s) => sum + (s.gainedXpInModule ?? 0),
          0,
        )
        const maxTotalXp = Math.max(...enrichedSkills.map((s) => s.totalXp), 0)
        const axisMax = Math.max(
          3000,
          Math.ceil(maxTotalXp / 1500) * 1500,
        )
        const topSkills = [...enrichedSkills]
          .sort((a, b) => b.totalXp - a.totalXp)
          .slice(0, 2)
          .map((s) => ({
            skillId: s.skillId,
            name: s.name,
            slug: s.slug,
            weight: s.weight,
            totalXp: s.totalXp,
            gainedXpInModule: s.gainedXpInModule,
            previousXp: s.previousXp,
          }))

        return reply.status(200).send({
          courseId,
          skills: enrichedSkills,
          xpGainedInModule,
          axisMax,
          topSkills,
        })
      }
    }

    // Sem moduleId: mantém comportamento atual (skills do curso).
    if (courseSkills.length === 0) {
      return reply.status(200).send({
        courseId,
        skills: [],
      })
    }

    const skillIds = courseSkills.map((cs) => cs.skillId)

    const userSkills = await prisma.userSkillXp.findMany({
      where: {
        userId: targetUserId,
        skillId: {
          in: skillIds,
        },
      },
    })

    const xpBySkill = new Map<string, number>()
    for (const us of userSkills) {
      xpBySkill.set(us.skillId, us.xp)
    }

    const skills = courseSkills.map((cs) => ({
      skillId: cs.skillId,
      name: cs.skill.name,
      slug: cs.skill.slug,
      weight: cs.weight,
      totalXp: xpBySkill.get(cs.skillId) ?? 0,
    }))

    return reply.status(200).send({
      courseId,
      skills,
    })
  } catch (error) {
    console.error('Erro ao buscar progresso de skills do curso:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

