"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "ch:workspace-tabs";
const MAX_TABS = 12;

export interface WorkspaceTab {
  key: string;
  href: string;
  label: string;
  icon?: string | null;
  pinned?: boolean;
}

interface WorkspaceTabsContextValue {
  tabs: WorkspaceTab[];
  activePath: string;
  openTab: (tab: WorkspaceTab) => void;
  closeTab: (key: string) => void;
  closeAllTabs: () => void;
  togglePinTab: (key: string) => void;
  moveTab: (activeKey: string, overKey: string) => void;
}

const WorkspaceTabsContext = createContext<WorkspaceTabsContextValue | null>(
  null,
);

function normalizePath(path: string) {
  const base = path.split("?")[0].replace(/\/$/, "") || "/";
  return base;
}

function loadTabsFromStorage(): WorkspaceTab[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const tabs = parsed.filter(
      (t): t is WorkspaceTab =>
        t &&
        typeof t.key === "string" &&
        typeof t.href === "string" &&
        typeof t.label === "string",
    );
    const pinned = tabs.filter((t) => t.pinned);
    const unpinned = tabs.filter((t) => !t.pinned);
    return [...pinned, ...unpinned];
  } catch {
    return [];
  }
}

export function WorkspaceTabsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<WorkspaceTab[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTabs(loadTabsFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch {
      /* ignore */
    }
  }, [tabs, hydrated]);

  const openTab = useCallback((tab: WorkspaceTab) => {
    setTabs((prev) => {
      const index = prev.findIndex((t) => t.key === tab.key);
      if (index >= 0) {
        const current = prev[index];
        if (
          current.label === tab.label &&
          current.href === tab.href &&
          current.icon === tab.icon
        ) {
          return prev;
        }
        const next = [...prev];
        next[index] = { ...current, ...tab, pinned: current.pinned };
        return next;
      }

      const pinned = prev.filter((t) => t.pinned);
      const unpinned = prev.filter((t) => !t.pinned);
      let next = [...pinned, ...unpinned, tab];

      while (next.length > MAX_TABS) {
        const evictIndex = next.findIndex((t) => !t.pinned);
        if (evictIndex < 0) break;
        next.splice(evictIndex, 1);
      }

      return next;
    });
  }, []);

  const closeTab = useCallback(
    (key: string) => {
      let hrefToNavigate: string | undefined;

      setTabs((prev) => {
        const index = prev.findIndex((t) => t.key === key);
        if (index < 0) return prev;

        const closing = prev[index];
        const next = prev.filter((t) => t.key !== key);
        const isActive =
          normalizePath(pathname) === normalizePath(closing.href);

        if (isActive) {
          hrefToNavigate =
            next.length > 0
              ? next[Math.min(index, next.length - 1)].href
              : "/courses";
        }

        return next;
      });

      if (hrefToNavigate) {
        queueMicrotask(() => router.push(hrefToNavigate!));
      }
    },
    [pathname, router],
  );

  const moveTab = useCallback((activeKey: string, overKey: string) => {
    if (activeKey === overKey) return;
    setTabs((prev) => {
      const oldIndex = prev.findIndex((t) => t.key === activeKey);
      const newIndex = prev.findIndex((t) => t.key === overKey);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;

      const activeTab = prev[oldIndex];
      const overTab = prev[newIndex];
      if (!!activeTab.pinned !== !!overTab.pinned) return prev;

      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }, []);

  const togglePinTab = useCallback((key: string) => {
    setTabs((prev) => {
      const index = prev.findIndex((t) => t.key === key);
      if (index < 0) return prev;

      const tab = prev[index];
      const willPin = !tab.pinned;
      const rest = prev.filter((t) => t.key !== key);
      const updated = { ...tab, pinned: willPin };

      const pinned = rest.filter((t) => t.pinned);
      const unpinned = rest.filter((t) => !t.pinned);

      if (willPin) {
        return [...pinned, updated, ...unpinned];
      }

      return [...pinned, updated, ...unpinned];
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
  }, []);

  const value = useMemo(
    () => ({
      tabs,
      activePath: pathname,
      openTab,
      closeTab,
      closeAllTabs,
      togglePinTab,
      moveTab,
    }),
    [tabs, pathname, openTab, closeTab, closeAllTabs, togglePinTab, moveTab],
  );

  return (
    <WorkspaceTabsContext.Provider value={value}>
      {children}
    </WorkspaceTabsContext.Provider>
  );
}

export function useWorkspaceTabs() {
  const ctx = useContext(WorkspaceTabsContext);
  if (!ctx) {
    throw new Error("useWorkspaceTabs must be used within WorkspaceTabsProvider");
  }
  return ctx;
}

/** Registra a página atual na barra de abas abertas (estilo VS Code). */
export function useWorkspaceTab(tab: WorkspaceTab | null | undefined) {
  const { openTab } = useWorkspaceTabs();
  const tabKey = tab?.key;
  const tabHref = tab?.href;
  const tabLabel = tab?.label;
  const tabIcon = tab?.icon;

  useEffect(() => {
    if (!tabKey || !tabHref || !tabLabel) return;
    openTab({ key: tabKey, href: tabHref, label: tabLabel, icon: tabIcon });
  }, [tabKey, tabHref, tabLabel, tabIcon, openTab]);
}
