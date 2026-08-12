"use client";

import type { ForumQuestionListItem } from "@/types/forum";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias atrás`;
  return date.toLocaleDateString("pt-BR");
}

type ForumQuestionCardProps = {
  question: ForumQuestionListItem;
  onClick: () => void;
};

export function ForumQuestionCard({ question, onClick }: ForumQuestionCardProps) {
  const courseTitle = question.course?.title ?? "Geral";
  const initial = courseTitle.slice(0, 2).toUpperCase();
  const statusClass =
    question.status === "ANSWERED"
      ? "forum-status-answered"
      : "forum-status-waiting";

  return (
    <button type="button" className="forum-card" onClick={onClick}>
      <div
        className="forum-card-icon"
        style={
          question.course?.colorHex
            ? { background: question.course.colorHex }
            : undefined
        }
      >
        {question.course?.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={question.course.thumbnail} alt={courseTitle} />
        ) : (
          <span className="forum-card-icon-fallback">{initial}</span>
        )}
      </div>

      <div className="forum-card-body">
        <span className="forum-card-meta">
          {formatRelativeTime(question.createdAt)}
          {question.lesson ? ` · ${question.lesson.title}` : ` · ${courseTitle}`}
        </span>
        <p className="forum-card-preview">
          {question.preview || question.body}
        </p>
      </div>

      <span className={`forum-card-status ${statusClass}`} aria-hidden />
    </button>
  );
}
