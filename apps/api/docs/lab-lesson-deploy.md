# Lab lesson type — deploy notes

## Migration

This feature adds:
- `LessonType` enum value `lab`
- table `Lab` (1:1 with `Lesson`)

Migration folder:
`apps/api/prisma/migrations/20260717150000_add_lab_lesson_type`

## Render / production

The monorepo does **not** run `prisma migrate deploy` automatically on build
(`package.json` only runs `prisma generate`).

Before traffic hits the new API:

```bash
cd apps/api
pnpm exec prisma migrate deploy
```

Or configure a Render **Release Command** to run the same.

Without migrate deploy, create/update of `lab` lessons will fail.
