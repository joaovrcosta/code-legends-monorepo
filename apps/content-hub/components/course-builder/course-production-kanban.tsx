"use client";

import { useMemo, useState } from "react";
import type { ModuleWithStructure } from "@/actions/course";
import type {
  LessonProductionItem,
  LessonProductionPriority,
  LessonProductionStatus,
} from "@/actions/lesson/get-lesson-production-by-course";
import { updateLessonProduction } from "@/actions/lesson/update-lesson-production";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CourseProductionLogs } from "./course-production-logs";
import { LessonEditModal } from "./lesson-edit-modal";
import type { LessonWithStructure } from "@/actions/course/get-course-with-structure";
import {
  buildLessonBreadcrumbFromContext,
  findLessonContext,
  type LessonBreadcrumbContext,
} from "@/lib/course-structure";
import { StickyNote, X } from "lucide-react";
import { validateLessonProductionNotesLength } from "@/lib/lesson-production-labels";

type KanbanStatus = LessonProductionStatus;

const STATUSES: KanbanStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"];

const PRIORITIES: LessonProductionPriority[] = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

function priorityLabel(p: LessonProductionPriority): string {
  switch (p) {
    case "NONE":
      return "Sem prioridade";
    case "LOW":
      return "Baixa prioridade";
    case "MEDIUM":
      return "Média prioridade";
    case "HIGH":
      return "Alta prioridade";
    case "URGENT":
      return "Urgente";
  }
}

function priorityBadgeClass(p: LessonProductionPriority): string {
  switch (p) {
    case "NONE":
      return "";
    case "LOW":
      return "bg-emerald-600 text-white border-emerald-500/40";
    case "MEDIUM":
      return "bg-amber-500 text-zinc-950 border-amber-400/50";
    case "HIGH":
      return "bg-rose-600 text-white border-rose-500/40";
    case "URGENT":
      return "bg-red-700 text-white border-red-600/50";
  }
}

function statusLabel(s: KanbanStatus) {
  switch (s) {
    case "TODO":
      return "A fazer";
    case "IN_PROGRESS":
      return "Em produção";
    case "REVIEW":
      return "Em revisão";
    case "DONE":
      return "Feita";
    case "BLOCKED":
      return "Bloqueada";
  }
}

function statusAccentClass(s: KanbanStatus) {
  switch (s) {
    case "TODO":
      return "bg-zinc-300/70";
    case "IN_PROGRESS":
      return "bg-sky-400/80";
    case "REVIEW":
      return "bg-violet-400/80";
    case "DONE":
      return "bg-emerald-400/80";
    case "BLOCKED":
      return "bg-rose-400/80";
  }
}

type KanbanCard = {
  lessonId: number;
  title: string;
  type: string;
  moduleId: string;
  moduleTitle: string;
  groupId: number;
  groupTitle: string;
  status: KanbanStatus;
  priority: LessonProductionPriority;
  notes: string | null;
};

function lessonTypePillClass(type: string) {
  const key = (type ?? "").trim().toLowerCase();
  switch (key) {
    case "video":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200";
    case "article":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "quiz":
    case "multi_quiz":
      return "border-violet-400/20 bg-violet-400/10 text-violet-200";
    case "project":
      return "border-orange-400/20 bg-orange-400/10 text-orange-200";
    case "text":
      return "border-white/10 bg-white/5 text-zinc-200";
    default:
      return "border-white/10 bg-white/5 text-zinc-200";
  }
}

function cardId(card: KanbanCard) {
  return `lesson-${card.lessonId}`;
}

function parseCardId(id: string): number | null {
  const m = /^lesson-(\d+)$/.exec(id);
  return m ? Number(m[1]) : null;
}

function getLessonStatus(lesson: { production?: { status?: string } | null }): KanbanStatus {
  const s = (lesson.production?.status as KanbanStatus | undefined) ?? "TODO";
  return STATUSES.includes(s) ? s : "TODO";
}

function getLessonPriority(lesson: {
  production?: { priority?: string } | null;
}): LessonProductionPriority {
  const p = lesson.production?.priority as LessonProductionPriority | undefined;
  return p && PRIORITIES.includes(p) ? p : "NONE";
}

function normalizeNotes(value: unknown): string {
  return (value ?? "").toString();
}

function DroppableColumn({
  status,
  children,
}: {
  status: KanbanStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `status-${status}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "min-h-[220px] max-h-[640px] overflow-y-auto rounded-2xl border p-2 transition-colors",
        "border-white/10 bg-white/5 shadow-sm backdrop-blur-[1px]",
        isOver ? "ring-2 ring-lime-400/30 border-lime-400/30" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SortableCard({
  card,
  disabled,
  onEdit,
  onToggleNotes,
}: {
  card: KanbanCard;
  disabled?: boolean;
  onEdit?: (lessonId: number) => void;
  onToggleNotes: (lessonId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cardId(card),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-xl border px-3 py-2 text-sm shadow-sm",
        "border-white/10 bg-zinc-950/40 hover:bg-zinc-950/55 transition-colors",
      ].join(" ")}
    >
      {card.priority !== "NONE" && (
        <div
          className={[
            "mb-2 inline-flex h-4 max-w-full items-center rounded-full border px-2.5 py-0 text-[10px] font-bold leading-none uppercase tracking-wide",
            priorityBadgeClass(card.priority),
          ].join(" ")}
        >
          <span className="truncate leading-none">{priorityLabel(card.priority)}</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(card.lessonId)}
              className="font-medium text-zinc-100 cursor-pointer text-left hover:underline underline-offset-2 min-w-0"
              title="Editar aula"
            >
              <span className="clamp-2 wrap-break-word">{card.title}</span>
            </button>
          ) : (
            <div className="font-medium text-zinc-100 min-w-0" title={card.title}>
              <span className="clamp-2 wrap-break-word">{card.title}</span>
            </div>
          )}
          <div
            className="text-[11px] text-zinc-400 truncate"
            title={`${card.moduleTitle} • ${card.groupTitle}`}
          >
            {card.moduleTitle} • {card.groupTitle}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <button
            type="button"
            className="shrink-0 inline-flex h-8 w-8 cursor-grab active:cursor-grabbing items-center justify-center rounded-md border border-white/10 text-xs text-zinc-300 bg-white/5 hover:bg-white/10 transition-colors"
            disabled={disabled}
            {...attributes}
            {...listeners}
            aria-label="Arrastar"
            title="Arrastar"
          >
            ⋮⋮
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
        <span
          className={[
            "rounded-md border px-2 py-0.5",
            lessonTypePillClass(card.type),
          ].join(" ")}
        >
          {card.type}
        </span>
        <button
          type="button"
          onClick={() => onToggleNotes(card.lessonId)}
          className={[
            "relative inline-flex h-8 w-8 items-center justify-center rounded-md border",
            "border-white/10 bg-white/5 hover:bg-white/10 transition-colors",
          ].join(" ")}
          title="Anotações"
          aria-label="Anotações"
        >
          <StickyNote className="h-4 w-4 text-zinc-200" />
          {(card.notes?.trim?.() ?? "") !== "" && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_0_2px_rgba(0,0,0,0.6)]" />
          )}
        </button>
      </div>
    </div>
  );
}

export function CourseProductionKanban({
  courseId,
  courseTitle,
  modules,
  onModulesChange,
}: {
  courseId: string;
  courseTitle: string;
  modules: ModuleWithStructure[];
  onModulesChange: (next: ModuleWithStructure[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("__all__");
  const [groupFilter, setGroupFilter] = useState<string>("__all__");
  const [typeFilter, setTypeFilter] = useState<string>("__all__");
  const [busyLessonIds, setBusyLessonIds] = useState<Set<number>>(new Set());
  const [refreshLogsKey, setRefreshLogsKey] = useState(0);
  const [editingLesson, setEditingLesson] = useState<LessonWithStructure | null>(null);
  const [editingBreadcrumb, setEditingBreadcrumb] =
    useState<LessonBreadcrumbContext | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [notesModalLessonId, setNotesModalLessonId] = useState<number | null>(null);
  const [notesDraftByLessonId, setNotesDraftByLessonId] = useState<Map<number, string>>(
    new Map(),
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { cards, groupsByModule } = useMemo(() => {
    const allCards: KanbanCard[] = [];
    const groupsByModule = new Map<string, Array<{ id: number; title: string }>>();

    for (const m of modules) {
      for (const g of m.groups) {
        const list = groupsByModule.get(m.id) ?? [];
        if (!list.some((x) => x.id === g.id)) {
          list.push({ id: g.id, title: g.title });
          groupsByModule.set(m.id, list);
        }
        for (const l of g.lessons) {
          allCards.push({
            lessonId: l.id,
            title: l.title,
            type: l.type,
            moduleId: m.id,
            moduleTitle: m.title,
            groupId: g.id,
            groupTitle: g.title,
            status: getLessonStatus(l),
            priority: getLessonPriority(l),
            notes: l.production?.notes ?? null,
          });
        }
      }
    }

    return { cards: allCards, groupsByModule };
  }, [modules]);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      if (moduleFilter !== "__all__" && c.moduleId !== moduleFilter) return false;
      if (groupFilter !== "__all__" && String(c.groupId) !== groupFilter) return false;
      if (typeFilter !== "__all__" && c.type !== typeFilter) return false;
      if (q && !c.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cards, search, moduleFilter, groupFilter, typeFilter]);

  const columns = useMemo(() => {
    const byStatus = new Map<KanbanStatus, KanbanCard[]>();
    for (const s of STATUSES) byStatus.set(s, []);
    for (const c of filteredCards) {
      byStatus.get(c.status)!.push(c);
    }
    return byStatus;
  }, [filteredCards]);

  const allTypes = useMemo(() => {
    const set = new Set(cards.map((c) => c.type));
    return Array.from(set).sort();
  }, [cards]);

  const groupOptions = useMemo(() => {
    if (moduleFilter === "__all__") return [];
    return (groupsByModule.get(moduleFilter) ?? []).slice().sort((a, b) => a.title.localeCompare(b.title));
  }, [groupsByModule, moduleFilter]);

  const applyLessonProductionItem = (lessonId: number, item: LessonProductionItem) => {
    const next = modules.map((m) => ({
      ...m,
      groups: m.groups.map((g) => ({
        ...g,
        lessons: g.lessons.map((l) =>
          l.id === lessonId
            ? {
              ...l,
              production: {
                status: item.status,
                priority: item.priority,
                notes: item.notes ?? null,
                updatedAt: item.updatedAt,
                updatedById: item.updatedById,
              },
            }
            : l
        ),
      })),
    }));
    onModulesChange(next);
  };

  const setLessonStatusInModules = (lessonId: number, status: KanbanStatus) => {
    const next = modules.map((m) => ({
      ...m,
      groups: m.groups.map((g) => ({
        ...g,
        lessons: g.lessons.map((l) =>
          l.id === lessonId
            ? {
              ...l,
              production: {
                status,
                priority: getLessonPriority(l),
                notes: l.production?.notes ?? null,
                updatedAt: l.production?.updatedAt ?? new Date().toISOString(),
                updatedById: l.production?.updatedById ?? "",
              },
            }
            : l
        ),
      })),
    }));
    onModulesChange(next);
  };

  const setLessonNotesInModules = (lessonId: number, notes: string | null) => {
    const next = modules.map((m) => ({
      ...m,
      groups: m.groups.map((g) => ({
        ...g,
        lessons: g.lessons.map((l) =>
          l.id === lessonId
            ? {
              ...l,
              production: {
                status: (l.production?.status as KanbanStatus | undefined) ?? "TODO",
                priority: getLessonPriority(l),
                notes,
                updatedAt: l.production?.updatedAt ?? new Date().toISOString(),
                updatedById: l.production?.updatedById ?? "",
              },
            }
            : l
        ),
      })),
    }));
    onModulesChange(next);
  };

  const findLessonById = (lessonId: number): LessonWithStructure | null => {
    for (const m of modules) {
      for (const g of m.groups) {
        for (const l of g.lessons) {
          if (l.id === lessonId) return l as LessonWithStructure;
        }
      }
    }
    return null;
  };

  const replaceLessonInModules = (updated: LessonWithStructure) => {
    const next = modules.map((m) => ({
      ...m,
      groups: m.groups.map((g) => ({
        ...g,
        lessons: g.lessons.map((l) => (l.id === updated.id ? updated : l)),
      })),
    }));
    onModulesChange(next);
  };

  const openLessonEditor = (lessonId: number) => {
    const ctx = findLessonContext(modules, lessonId);
    if (!ctx) {
      toast.error("Aula não encontrada na estrutura carregada.");
      return;
    }
    setEditingLesson(ctx.lesson);
    setEditingBreadcrumb(
      buildLessonBreadcrumbFromContext(ctx, courseTitle),
    );
    setEditOpen(true);
  };

  const openNotesModal = (lessonId: number) => {
    if (!notesDraftByLessonId.has(lessonId)) {
      const current = filteredCards.find((c) => c.lessonId === lessonId);
      setNotesDraftByLessonId((prev) => {
        const next = new Map(prev);
        next.set(lessonId, normalizeNotes(current?.notes ?? ""));
        return next;
      });
    }
    setNotesModalLessonId(lessonId);
  };

  const changeNotes = (lessonId: number, nextValue: string) => {
    setNotesDraftByLessonId((prev) => {
      const next = new Map(prev);
      next.set(lessonId, nextValue);
      return next;
    });
  };

  const saveNotes = async (lessonId: number) => {
    if (busyLessonIds.has(lessonId)) return;

    const currentCard = filteredCards.find((c) => c.lessonId === lessonId);
    if (!currentCard) return;

    const nextNotes = normalizeNotes(notesDraftByLessonId.get(lessonId));
    const prevNotes = normalizeNotes(currentCard.notes ?? "");
    if (nextNotes === prevNotes) return;

    const notesLengthError = validateLessonProductionNotesLength(nextNotes);
    if (notesLengthError) {
      toast.error(notesLengthError);
      return;
    }

    setLessonNotesInModules(lessonId, nextNotes.trim() ? nextNotes : null);
    setBusyLessonIds((prev) => new Set(prev).add(lessonId));

    try {
      const token = getAuthTokenFromClient();
      if (!token) throw new Error("Token não encontrado");
      const result = await updateLessonProduction(
        lessonId,
        { status: currentCard.status, notes: nextNotes },
        token,
      );
      applyLessonProductionItem(lessonId, result.item);
      toast.success("Anotações salvas.");
    } catch (err: any) {
      setLessonNotesInModules(lessonId, currentCard.notes ?? null);
      toast.error(err?.message ?? "Erro ao salvar anotações");
    } finally {
      setBusyLessonIds((prev) => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });
    }
  };

  const modalCard = notesModalLessonId
    ? filteredCards.find((c) => c.lessonId === notesModalLessonId) ?? null
    : null;

  const modalNotesValue = notesModalLessonId
    ? notesDraftByLessonId.get(notesModalLessonId) ?? normalizeNotes(modalCard?.notes ?? "")
    : "";

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    const lessonId = parseCardId(activeId);
    if (!lessonId) return;

    // overId é a coluna (status-XXX) ou outro card. Se for card, inferimos coluna pelo status atual do card embaixo.
    let nextStatus: KanbanStatus | null = null;
    if (overId?.startsWith("status-")) {
      nextStatus = overId.replace("status-", "") as KanbanStatus;
    } else if (overId?.startsWith("lesson-")) {
      const overLessonId = parseCardId(overId);
      const overCard = filteredCards.find((c) => c.lessonId === overLessonId);
      nextStatus = overCard?.status ?? null;
    }
    if (!nextStatus || !STATUSES.includes(nextStatus)) return;

    const currentCard = filteredCards.find((c) => c.lessonId === lessonId);
    if (!currentCard || currentCard.status === nextStatus) return;

    if (busyLessonIds.has(lessonId)) return;

    // UI otimista
    setLessonStatusInModules(lessonId, nextStatus);
    setBusyLessonIds((prev) => new Set(prev).add(lessonId));

    try {
      const token = getAuthTokenFromClient();
      if (!token) throw new Error("Token não encontrado");
      const result = await updateLessonProduction(lessonId, { status: nextStatus }, token);
      applyLessonProductionItem(lessonId, result.item);
      setRefreshLogsKey((k) => k + 1);
    } catch (err: any) {
      // reverte
      setLessonStatusInModules(lessonId, currentCard.status);
      toast.error(err?.message ?? "Erro ao atualizar status");
    } finally {
      setBusyLessonIds((prev) => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Kanban editorial</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefreshLogsKey((k) => k + 1)}>
            Atualizar logs
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Buscar</label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Título da aula..." />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Módulo</label>
              <Select value={moduleFilter} onChange={(e) => {
                setModuleFilter(e.target.value);
                setGroupFilter("__all__");
              }}>
                <option value="__all__">Todos</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Grupo</label>
              <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} disabled={moduleFilter === "__all__"}>
                <option value="__all__">Todos</option>
                {groupOptions.map((g) => (
                  <option key={g.id} value={String(g.id)}>{g.title}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Tipo</label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="__all__">Todos</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 mt-8">
              {STATUSES.map((s) => {
                const list = columns.get(s) ?? [];
                return (
                  <div key={s} className="min-w-0">
                    <div className="mb-2">
                      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-sm">
                        <div className={["absolute left-0 top-0 h-[3px] w-full", statusAccentClass(s)].join(" ")} />
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="text-xs font-semibold text-zinc-100">{statusLabel(s)}</div>
                          <div className="text-[11px] font-medium text-zinc-200 rounded-full border border-white/10 bg-black/20 px-2 py-0.5">
                            {list.length}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DroppableColumn status={s}>
                      <SortableContext items={list.map((c) => cardId(c))} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2" data-status-column={`status-${s}`}>
                          {list.map((c) => (
                            <SortableCard
                              key={c.lessonId}
                              card={c}
                              disabled={busyLessonIds.has(c.lessonId)}
                              onEdit={openLessonEditor}
                              onToggleNotes={openNotesModal}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DroppableColumn>
                  </div>
                );
              })}
            </div>
          </DndContext>
        </CardContent>
      </Card>

      <CourseProductionLogs
        courseId={courseId}
        refreshKey={refreshLogsKey}
        onEditLesson={openLessonEditor}
      />

      {editingLesson && editingBreadcrumb && (
        <LessonEditModal
          lesson={editingLesson}
          breadcrumb={editingBreadcrumb}
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditingLesson(null);
            setEditingBreadcrumb(null);
          }}
          onSave={(updatedLesson) => {
            replaceLessonInModules(updatedLesson);
            setEditingLesson(updatedLesson);
            setEditOpen(false);
          }}
        />
      )}

      {notesModalLessonId != null && (
        <div className="cb-modal-overlay" role="dialog" aria-modal="true">
          <Card className="cb-modal-card-xl">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Anotações
                  </CardTitle>
                  {modalCard && (
                    <div className="mt-1 text-xs text-zinc-400 truncate">
                      {modalCard.moduleTitle} • {modalCard.groupTitle} •{" "}
                      <span className="text-zinc-200">{modalCard.title}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotesModalLessonId(null)}
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="cb-modal-body">
              <div className="cb-modal-scroll space-y-3">
                <textarea
                  value={modalNotesValue}
                  onChange={(e) => {
                    const id = notesModalLessonId;
                    if (id == null) return;
                    changeNotes(id, e.target.value);
                  }}
                  placeholder="Escreva suas anotações…"
                  className="min-h-[min(60vh,520px)] w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNotesModalLessonId(null)}
                    disabled={notesModalLessonId != null && busyLessonIds.has(notesModalLessonId)}
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={async () => {
                      const id = notesModalLessonId;
                      if (id == null) return;
                      await saveNotes(id);
                      setNotesModalLessonId(null);
                    }}
                    disabled={notesModalLessonId != null && busyLessonIds.has(notesModalLessonId)}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

