import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lessonsWithVideo = await prisma.lesson.findMany({
    where: { type: "video" },
    select: { id: true, video_url: true, video_duration: true },
  });

  let created = 0;
  for (const lesson of lessonsWithVideo) {
    const existing = await prisma.video.findUnique({
      where: { lessonId: lesson.id },
    });
    if (existing) continue;

    await prisma.video.create({
      data: {
        lessonId: lesson.id,
        url: lesson.video_url ?? undefined,
        duration: lesson.video_duration ?? undefined,
      },
    });
    created++;
  }

  console.log(`Created ${created} Video records for ${lessonsWithVideo.length} video lessons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
