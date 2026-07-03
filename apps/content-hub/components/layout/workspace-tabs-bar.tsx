"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, FileText, Pin, PinOff, User, X } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  useWorkspaceTabs,
  type WorkspaceTab,
} from "./workspace-tabs-context";

const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

function normalizePath(path: string) {
  const base = path.split("?")[0].replace(/\/$/, "") || "/";
  return base;
}

function WorkspaceTabContent({
  tab,
  isActive,
  isOverlay,
  pinned,
}: {
  tab: WorkspaceTab;
  isActive: boolean;
  isOverlay?: boolean;
  pinned?: boolean;
}) {
  const isUserTab = tab.key.startsWith("user:");
  const isPlanTab = tab.key.startsWith("plan:");

  return (
    <>
      {tab.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tab.icon}
          alt=""
          className={cn(
            "pointer-events-none h-4 w-4 shrink-0 object-cover",
            isUserTab && "rounded-full",
          )}
        />
      ) : isUserTab ? (
        <User
          className="pointer-events-none h-3.5 w-3.5 shrink-0 text-ch-muted"
          aria-hidden
        />
      ) : isPlanTab ? (
        <CreditCard
          className="pointer-events-none h-3.5 w-3.5 shrink-0 text-ch-muted"
          aria-hidden
        />
      ) : (
        <FileText
          className="pointer-events-none h-3.5 w-3.5 shrink-0 text-ch-muted"
          aria-hidden
        />
      )}
      {!pinned ? (
        <span className="pointer-events-none truncate">{tab.label}</span>
      ) : null}
      {isOverlay ? (
        <span className="flex w-7 shrink-0 items-center justify-center opacity-40">
          <X className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : null}
    </>
  );
}

function SortableWorkspaceTab({
  tab,
  isActive,
  isDraggingTab,
  showPinnedDivider,
  onClose,
  onContextMenu,
}: {
  tab: WorkspaceTab;
  isActive: boolean;
  isDraggingTab: boolean;
  showPinnedDivider?: boolean;
  onClose: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}) {
  const pinned = !!tab.pinned;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.key });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-workspace-tab
      onContextMenu={onContextMenu}
      className={cn(
        "group/tab relative flex h-[42px] shrink-0 cursor-grab items-stretch border-r border-ch-border active:cursor-grabbing",
        showPinnedDivider && "border-l border-l-ch-border",
        pinned ? "w-[42px] max-w-[42px]" : "max-w-[240px] min-w-0",
        isActive ? "bg-ch-canvas" : "bg-ch-surface",
        (isDragging || isDraggingTab) && "opacity-40",
      )}
      {...attributes}
      {...listeners}
    >
      <Link
        href={tab.href}
        role="tab"
        aria-selected={isActive}
        aria-label={tab.label}
        draggable={false}
        tabIndex={isDragging ? -1 : 0}
        title={pinned ? tab.label : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center text-xs transition-colors",
          pinned ? "justify-center px-0" : "gap-2 px-3",
          isActive
            ? "text-ch"
            : "text-ch-muted hover:bg-ch-surface-raised/50 hover:text-ch",
        )}
      >
        <WorkspaceTabContent
          tab={tab}
          isActive={isActive}
          pinned={pinned}
        />
      </Link>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center text-ch-muted transition-colors hover:bg-ch-surface-raised hover:text-ch",
          pinned
            ? "absolute top-1 right-0.5 h-4 w-4 rounded opacity-0 group-hover/tab:opacity-100"
            : "w-7 opacity-70 sm:opacity-0 sm:group-hover/tab:opacity-100",
        )}
        aria-label={`Fechar ${tab.label}`}
      >
        <X className={cn(pinned ? "h-3 w-3" : "h-3.5 w-3.5")} />
      </button>
    </div>
  );
}

export function WorkspaceTabsBar() {
  const { tabs, activePath, closeTab, closeAllTabs, togglePinTab, moveTab } =
    useWorkspaceTabs();
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabKey?: string;
  } | null>(null);

  useEffect(() => {
    if (!contextMenu) return;

    const closeMenu = () => setContextMenu(null);

    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [contextMenu]);

  const handleBarContextMenu = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("[data-workspace-tab]")) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleTabContextMenu = (tabKey: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, tabKey });
  };

  const contextMenuTab = contextMenu?.tabKey
    ? tabs.find((t) => t.key === contextMenu.tabKey)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTab = tabs.find((tab) => tab.key === activeTabKey) ?? null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTabKey(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTabKey(null);
    if (!over || active.id === over.id) return;
    moveTab(String(active.id), String(over.id));
  };

  const handleDragCancel = () => {
    setActiveTabKey(null);
  };

  if (tabs.length === 0) return null;

  return (
    <div
      className="sticky top-0 z-20 shrink-0 overflow-hidden border-b border-ch-border bg-ch-surface"
      role="tablist"
      aria-label="Abas abertas"
      onContextMenu={handleBarContextMenu}
    >
      <DndContext
        sensors={sensors}
        modifiers={[restrictToHorizontalAxis]}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={tabs.map((tab) => tab.key)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex h-[42px] touch-pan-x items-stretch overflow-x-auto overflow-y-hidden">
            {tabs.map((tab, index) => {
              const prevTab = tabs[index - 1];
              const showPinnedDivider =
                !tab.pinned && !!prevTab?.pinned;

              return (
                <SortableWorkspaceTab
                  key={tab.key}
                  tab={tab}
                  isActive={
                    normalizePath(activePath) === normalizePath(tab.href)
                  }
                  isDraggingTab={activeTabKey === tab.key}
                  showPinnedDivider={showPinnedDivider}
                  onClose={() => closeTab(tab.key)}
                  onContextMenu={handleTabContextMenu(tab.key)}
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay modifiers={[restrictToHorizontalAxis]}>
          {activeTab ? (
            <div
              className={cn(
                "flex h-[42px] cursor-grabbing items-center border border-ch-border text-xs text-ch shadow-lg",
                activeTab.pinned
                  ? "w-[42px] justify-center bg-ch-canvas px-0"
                  : "max-w-[240px] min-w-[140px] gap-2 bg-ch-canvas px-3",
                normalizePath(activePath) === normalizePath(activeTab.href)
                  ? "bg-ch-canvas"
                  : "bg-ch-surface",
              )}
            >
              <WorkspaceTabContent
                tab={activeTab}
                isActive={
                  normalizePath(activePath) === normalizePath(activeTab.href)
                }
                pinned={!!activeTab.pinned}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {contextMenu ? (
        <div
          className="fixed z-100 min-w-[160px] overflow-hidden rounded-md border border-ch-border bg-ch-surface py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {contextMenuTab ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-ch transition-colors hover:bg-ch-surface-raised"
                onClick={() => {
                  togglePinTab(contextMenuTab.key);
                  setContextMenu(null);
                }}
              >
                {contextMenuTab.pinned ? (
                  <>
                    <PinOff className="h-3.5 w-3.5 shrink-0 text-ch-muted" />
                    Desafixar
                  </>
                ) : (
                  <>
                    <Pin className="h-3.5 w-3.5 shrink-0 text-ch-muted" />
                    Fixar
                  </>
                )}
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full px-3 py-1.5 text-left text-xs text-ch transition-colors hover:bg-ch-surface-raised"
                onClick={() => {
                  closeTab(contextMenuTab.key);
                  setContextMenu(null);
                }}
              >
                Fechar
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-1.5 text-left text-xs text-ch transition-colors hover:bg-ch-surface-raised"
              onClick={() => {
                closeAllTabs();
                setContextMenu(null);
              }}
            >
              Fechar tudo
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
