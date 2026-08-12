"use client";

import { useEffect, useState } from "react";
import { getForumQuestion } from "@/actions/forum/get-question";
import type { ForumQuestionDetail } from "@/types/forum";
import { ForumMarkdown } from "./forum-markdown";

type QuestionDetailModalProps = {
  questionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

export function QuestionDetailModal({
  questionId,
  open,
  onOpenChange,
}: QuestionDetailModalProps) {
  const [question, setQuestion] = useState<ForumQuestionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !questionId) {
      setQuestion(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getForumQuestion(questionId)
      .then((data) => {
        if (!cancelled) setQuestion(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, questionId]);

  if (!open || !questionId) return null;

  return (
    <div
      className="forum-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forum-detail-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="forum-modal forum-modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="forum-close-row">
          <button
            type="button"
            className="forum-close-btn"
            aria-label="Fechar"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>

        <h2 id="forum-detail-title" className="forum-modal-title">
          Dúvida
        </h2>

        {loading && <p className="forum-empty">Carregando...</p>}

        {!loading && !question && (
          <p className="forum-error">Não foi possível carregar a pergunta.</p>
        )}

        {!loading && question && (
          <>
            <div className="forum-detail-meta">
              <span>{formatRelativeTime(question.createdAt)}</span>
              <span>{question.course?.title ?? "Geral"}</span>
              {question.lesson && <span>{question.lesson.title}</span>}
              <span>
                {question.status === "ANSWERED"
                  ? "Respondida"
                  : "Aguardando resposta"}
              </span>
            </div>

            <div className="forum-detail-body">
              <ForumMarkdown content={question.body} />
            </div>

            <h3 className="forum-answers-title">
              Respostas do tutor ({question.answers.length})
            </h3>

            {question.answers.length === 0 ? (
              <p className="forum-no-answers">
                Aguardando resposta do tutor.
              </p>
            ) : (
              <div className="forum-answers">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="forum-answer">
                    <div className="forum-answer-header">
                      <span className="forum-answer-author">
                        {answer.author.name}
                      </span>
                      <span className="forum-answer-time">
                        {formatRelativeTime(answer.createdAt)}
                      </span>
                    </div>
                    <ForumMarkdown content={answer.body} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
