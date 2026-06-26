/**
 * Composições de classes reutilizáveis — edite aqui para mudar padrões visuais globais.
 * Cores/radius vêm de styles/tokens.css via classes Tailwind ch-*.
 */
export const ch = {
  /** Card / painel padrão */
  surface:
    "bg-ch-surface border border-ch-border rounded-ch-lg text-ch",
  /** Surface com hover para itens clicáveis */
  surfaceInteractive:
    "bg-ch-surface border border-ch-border rounded-ch-lg text-ch transition-colors hover:bg-ch-surface-raised",
  /** Input, textarea, select */
  input:
    "flex h-10 w-full rounded-ch border border-ch-border bg-ch-surface px-3 py-2 text-sm text-ch placeholder:text-ch-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ch-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ch-canvas disabled:cursor-not-allowed disabled:opacity-50",
  /** Item de navegação ativo */
  navItemActive: "bg-ch-accent-soft text-ch-accent",
  /** Item de navegação inativo */
  navItem:
    "text-ch-muted hover:bg-ch-surface-raised hover:text-ch transition-colors",
  /** Espaçamento vertical de página */
  page: "space-y-6",
  /** Label de seção (sidebar, formulários) */
  mutedLabel:
    "text-xs font-medium uppercase tracking-wide text-ch-muted",
  /** Botão primário */
  btnPrimary:
    "bg-ch-accent text-white hover:bg-ch-accent-hover focus-visible:ring-ch-accent",
  /** Botão outline */
  btnOutline:
    "border border-ch-border bg-transparent hover:bg-ch-surface-raised text-ch",
  /** Botão ghost */
  btnGhost: "hover:bg-ch-surface-raised text-ch-muted hover:text-ch",
  /** Botão secundário */
  btnSecondary:
    "bg-ch-surface-raised text-ch hover:bg-ch-border-subtle border border-ch-border",
  /** Tabs list (segmented) */
  tabsList: "inline-flex h-10 items-center rounded-ch bg-ch-surface-raised p-1",
  /** Tab trigger ativo */
  tabsTriggerActive:
    "data-[state=active]:bg-ch-accent-soft data-[state=active]:text-ch-accent data-[state=active]:shadow-none",
  /** Tab trigger inativo */
  tabsTrigger:
    "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] px-3 py-1.5 text-sm font-medium text-ch-muted transition-all data-[state=active]:text-ch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ch-accent disabled:pointer-events-none disabled:opacity-50",
  /** Linha de tabela com hover */
  tableRow:
    "transition-colors hover:bg-ch-surface-raised data-[state=selected]:bg-ch-accent-soft",
  /** Item de lista do editor ativo */
  editorItemActive:
    "border-ch-accent bg-ch-accent-soft ring-1 ring-ch-accent/30",
  /** Item de lista do editor inativo */
  editorItem:
    "border-ch-border bg-ch-surface hover:bg-ch-surface-raised",
} as const;
