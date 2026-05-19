/**
 * Seed built-in video providers and backfill Video.providerId from URLs.
 * Run: pnpm exec tsx prisma/scripts/seed-video-providers.ts
 */
import { PrismaClient } from '@prisma/client'
import {
  BUILTIN_PROVIDER_SEEDS,
  detectHandlerKeyFromUrl,
} from '@code-legends/video-providers'

const prisma = new PrismaClient()

async function main() {
  const slugToId = new Map<string, string>()

  for (const seed of BUILTIN_PROVIDER_SEEDS) {
    const provider = await prisma.videoProvider.upsert({
      where: { slug: seed.slug },
      create: {
        name: seed.name,
        slug: seed.slug,
        handlerKey: seed.handlerKey,
        isBuiltin: true,
        isDefault: seed.isDefault ?? false,
        status: 'ACTIVE',
        urlPlaceholder: seed.urlPlaceholder,
        helpText: seed.helpText ?? null,
        allowedDomains: seed.allowedDomains,
        allowedProtocols: ['https'],
        sortOrder: seed.sortOrder,
      },
      update: {
        name: seed.name,
        handlerKey: seed.handlerKey,
        urlPlaceholder: seed.urlPlaceholder,
        helpText: seed.helpText ?? null,
        allowedDomains: seed.allowedDomains,
        sortOrder: seed.sortOrder,
      },
    })
    slugToId.set(seed.slug, provider.id)
  }

  const defaults = await prisma.videoProvider.findMany({
    where: { isDefault: true },
  })
  if (defaults.length > 1) {
    const pandaId = slugToId.get('panda')
    await prisma.videoProvider.updateMany({ data: { isDefault: false } })
    if (pandaId) {
      await prisma.videoProvider.update({
        where: { id: pandaId },
        data: { isDefault: true },
      })
    }
  } else if (defaults.length === 0) {
    const pandaId = slugToId.get('panda')
    if (pandaId) {
      await prisma.videoProvider.update({
        where: { id: pandaId },
        data: { isDefault: true },
      })
    }
  }

  const genericId = slugToId.get('generic')
  const videos = await prisma.video.findMany({
    where: { url: { not: null } },
    select: { id: true, url: true, providerId: true },
  })

  let updated = 0
  let unmapped = 0

  for (const video of videos) {
    if (!video.url || video.providerId) continue
    const handlerKey = detectHandlerKeyFromUrl(video.url)
    const slug =
      handlerKey ??
      (video.url.includes('/embed/') || video.url.includes('player.')
        ? 'generic'
        : null)

    const providerId = slug ? slugToId.get(slug) ?? genericId : genericId
    if (!providerId) {
      unmapped++
      continue
    }

    await prisma.video.update({
      where: { id: video.id },
      data: { providerId },
    })
    updated++
  }

  console.log(`Video providers seeded. Videos backfilled: ${updated}, unmapped: ${unmapped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
