import type { LessonWithStructure } from "@/actions/course/get-course-with-structure";

export const VIDEO_ISSUE_NOTE_PREFIX = "⚠️ Vídeo:";

export function formatVideoIssueNote(warnings: string[]): string {
  return `${VIDEO_ISSUE_NOTE_PREFIX} ${warnings.join(" ")}`;
}

export function appendVideoIssueNote(
  existing: string | null | undefined,
  warnings: string[],
): string {
  const line = formatVideoIssueNote(warnings);
  if (!existing?.trim()) return line;
  if (existing.includes(VIDEO_ISSUE_NOTE_PREFIX)) return existing;
  return `${existing.trim()}\n${line}`;
}

export function getLessonVideoIssue(lesson: LessonWithStructure): string | null {
  const notes = lesson.production?.notes ?? "";
  if (notes.includes(VIDEO_ISSUE_NOTE_PREFIX)) {
    const line = notes
      .split("\n")
      .find((entry) => entry.includes(VIDEO_ISSUE_NOTE_PREFIX));
    return line?.trim() ?? null;
  }

  const isVideo = (lesson.type ?? "").trim().toLowerCase() === "video";
  if (!isVideo) return null;

  const url = (lesson.video?.url ?? lesson.video_url ?? "").trim();
  if (!url) return "Vídeo não vinculado";

  return null;
}

export function formatVideoIssueLabel(issue: string): string {
  return issue.startsWith(VIDEO_ISSUE_NOTE_PREFIX)
    ? issue.slice(VIDEO_ISSUE_NOTE_PREFIX.length).trim()
    : issue;
}
