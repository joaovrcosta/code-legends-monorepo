"use client";

import { useState } from "react";
import { Question } from "@phosphor-icons/react";
import type { ForumQuestionListItem } from "@/types/forum";
import { ForumQuestionCard } from "./forum-question-card";
import {
  NewQuestionModal,
  type ForumCourseOption,
} from "./new-question-modal";
import { QuestionDetailModal } from "./question-detail-modal";
import "./forum.css";

type ForumPageContentProps = {
  initialQuestions: ForumQuestionListItem[];
  courses: ForumCourseOption[];
};

export function ForumPageContent({
  initialQuestions,
  courses,
}: ForumPageContentProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  function handleCreated(question: ForumQuestionListItem) {
    setQuestions((prev) => [question, ...prev]);
  }

  return (
    <div className="forum-page">
      <div className="forum-header">
        <div className="forum-title-row">
          <span className="forum-title-icon">
            <Question size={28} weight="fill" />
          </span>
          <h1 className="forum-title">Dúvidas</h1>
        </div>
        <button
          type="button"
          className="forum-ask-btn"
          onClick={() => setNewOpen(true)}
        >
          Fazer pergunta
        </button>
      </div>

      <div className="forum-layout">
        <div>
          {questions.length === 0 ? (
            <p className="forum-empty">
              Você ainda não enviou nenhuma dúvida. Tire suas dúvidas com os
              tutores!
            </p>
          ) : (
            <ul className="forum-list">
              {questions.map((question) => (
                <li key={question.id}>
                  <ForumQuestionCard
                    question={question}
                    onClick={() => setDetailId(question.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="forum-legend" aria-label="Legenda de status">
          <div className="forum-legend-item">
            <span className="forum-legend-dot forum-status-waiting" />
            Aguardando resposta
          </div>
          <div className="forum-legend-item">
            <span className="forum-legend-dot forum-status-answered" />
            Respondida
          </div>
        </aside>
      </div>

      <NewQuestionModal
        open={newOpen}
        onOpenChange={setNewOpen}
        courses={courses}
        onCreated={handleCreated}
      />

      <QuestionDetailModal
        questionId={detailId}
        open={Boolean(detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      />
    </div>
  );
}
