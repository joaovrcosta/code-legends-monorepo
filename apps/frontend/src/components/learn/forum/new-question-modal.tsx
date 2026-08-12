"use client";

import { useEffect, useRef, useState } from "react";
import { createForumQuestion } from "@/actions/forum/create-question";
import { getCourseRoadmap } from "@/actions/course/roadmap";
import type { ForumQuestionListItem } from "@/types/forum";

export type ForumCourseOption = {
  id: string | null;
  title: string;
};

type LessonOption = {
  id: number;
  title: string;
};

type NewQuestionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: ForumCourseOption[];
  onCreated: (question: ForumQuestionListItem) => void;
};

const CODE_SNIPPET = "\n```js\n// seu código aqui\n\n```\n";

export function NewQuestionModal({
  open,
  onOpenChange,
  courses,
  onCreated,
}: NewQuestionModalProps) {
  const [courseId, setCourseId] = useState<string>("geral");
  const [lessonId, setLessonId] = useState<string>("");
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;

    setCourseId("geral");
    setLessonId("");
    setLessons([]);
    setBody("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || courseId === "geral") {
      setLessons([]);
      setLessonId("");
      return;
    }

    let cancelled = false;
    setLoadingLessons(true);

    getCourseRoadmap(courseId)
      .then((roadmap) => {
        if (cancelled || !roadmap) {
          setLessons([]);
          return;
        }
        const flat: LessonOption[] = [];
        for (const mod of roadmap.modules ?? []) {
          for (const group of mod.groups ?? []) {
            for (const lesson of group.lessons ?? []) {
              flat.push({ id: lesson.id, title: lesson.title });
            }
          }
        }
        setLessons(flat);
      })
      .catch(() => {
        if (!cancelled) setLessons([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLessons(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, open]);

  if (!open) return null;

  function insertCode() {
    const el = textareaRef.current;
    if (!el) {
      setBody((prev) => prev + CODE_SNIPPET);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = body.slice(0, start) + CODE_SNIPPET + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      const pos = start + CODE_SNIPPET.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createForumQuestion({
      body,
      courseId: courseId === "geral" ? null : courseId,
      lessonId: lessonId ? Number(lessonId) : null,
    });

    setSubmitting(false);

    if (!result.success || !result.question) {
      setError(result.message);
      return;
    }

    const created = result.question;
    onCreated({
      ...created,
      preview:
        created.preview ??
        created.body.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim().slice(0, 120),
    });
    onOpenChange(false);
  }

  return (
    <div
      className="forum-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forum-new-title"
      onClick={() => onOpenChange(false)}
    >
      <div className="forum-modal" onClick={(e) => e.stopPropagation()}>
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
        <h2 id="forum-new-title" className="forum-modal-title">
          Nova dúvida
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="forum-field">
            <label className="forum-label" htmlFor="forum-course">
              Curso
            </label>
            <select
              id="forum-course"
              className="forum-select"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setLessonId("");
              }}
            >
              <option value="geral">Geral</option>
              {courses
                .filter((c) => c.id)
                .map((c) => (
                  <option key={c.id!} value={c.id!}>
                    {c.title}
                  </option>
                ))}
            </select>
          </div>

          {courseId !== "geral" && (
            <div className="forum-field">
              <label className="forum-label" htmlFor="forum-lesson">
                Aula (opcional)
              </label>
              <select
                id="forum-lesson"
                className="forum-select"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                disabled={loadingLessons}
              >
                <option value="">
                  {loadingLessons ? "Carregando aulas..." : "Nenhuma aula específica"}
                </option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={String(lesson.id)}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="forum-field">
            <label className="forum-label" htmlFor="forum-body">
              Dúvida
            </label>
            <textarea
              id="forum-body"
              ref={textareaRef}
              className="forum-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Descreva sua dúvida detalhadamente aqui, ou anexe um trecho do código..."
              required
            />
          </div>

          <button type="button" className="forum-code-btn" onClick={insertCode}>
            {"</>"} Inserir trecho de código
          </button>

          {error && <p className="forum-error">{error}</p>}

          <button type="submit" className="forum-submit-btn" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
