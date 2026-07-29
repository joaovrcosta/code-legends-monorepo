/**
 * Script para verificar consistência da contagem de lições por curso.
 * Detecta se algum curso tem diferença entre:
 * - Total de lições via estrutura (modules -> submodules -> lessons) - usado no progresso
 * - Total de lições via count direto (Lesson onde submodule.module.courseId = X)
 *
 * Útil para encontrar inconsistência onde o artigo não entra no cálculo de conclusão.
 *
 * Uso: cd apps/api && npx tsx prisma/scripts/verify-course-lesson-count.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });

  console.log("\n=== Verificação de contagem de lições por curso ===\n");

  let hasInconsistency = false;

  for (const course of courses) {
    // Mesma query usada em get-progress e getAllLessonsInOrder: modules -> submodules -> lessons
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      include: {
        submodules: {
          include: {
            lessons: {
              select: { id: true, type: true, title: true },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    const lessonsViaStructure: Array<{ id: number; type: string; title: string }> = [];
    for (const mod of modules) {
      for (const sub of mod.submodules) {
        for (const lesson of sub.lessons) {
          lessonsViaStructure.push({
            id: lesson.id,
            type: lesson.type,
            title: lesson.title,
          });
        }
      }
    }

    // Count direto (todas as lessons do curso)
    const totalLessonsInDb = await prisma.lesson.count({
      where: {
        submodule: { module: { courseId: course.id } },
      },
    });

    const byType = lessonsViaStructure.reduce(
      (acc, l) => {
        acc[l.type] = (acc[l.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalViaStructure = lessonsViaStructure.length;
    const match = totalViaStructure === totalLessonsInDb;

    if (!match) {
      hasInconsistency = true;
      console.log(`❌ INCONSISTÊNCIA: ${course.title} (${course.slug})`);
      console.log(`   Via estrutura (progress): ${totalViaStructure}`);
      console.log(`   Via count direto:        ${totalLessonsInDb}`);
    }

    const hasArticle = (byType["ARTICLE"] ?? 0) > 0;
    const articleCount = byType["ARTICLE"] ?? 0;

    console.log(
      `${match ? "✅" : "  "} ${course.slug}: ${totalViaStructure} lições ${hasArticle ? `(${articleCount} artigo(s))` : ""}`
    );
    if (Object.keys(byType).length > 1) {
      console.log(`   Por tipo: ${JSON.stringify(byType)}`);
    }
  }

  if (hasInconsistency) {
    console.log("\n⚠️  Encontrada(s) inconsistência(s). O progresso/conclusão pode estar errado.");
    process.exit(1);
  }

  console.log("\n✅ Nenhuma inconsistência de contagem encontrada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
