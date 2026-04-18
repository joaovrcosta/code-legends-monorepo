"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RoadmapResponse } from "@/types/roadmap";

type ClassroomRoadmapContextValue = {
  roadmap: RoadmapResponse | null;
  setRoadmap: (r: RoadmapResponse | null) => void;
};

const ClassroomRoadmapContext =
  createContext<ClassroomRoadmapContextValue | null>(null);

export function ClassroomRoadmapProvider({ children }: { children: ReactNode }) {
  const [roadmap, setRoadmapState] = useState<RoadmapResponse | null>(null);
  const setRoadmap = useCallback((r: RoadmapResponse | null) => {
    setRoadmapState(r);
  }, []);

  const value = useMemo(
    () => ({ roadmap, setRoadmap }),
    [roadmap, setRoadmap],
  );

  return (
    <ClassroomRoadmapContext.Provider value={value}>
      {children}
    </ClassroomRoadmapContext.Provider>
  );
}

export function useClassroomRoadmap(): ClassroomRoadmapContextValue {
  const ctx = useContext(ClassroomRoadmapContext);
  if (!ctx) {
    throw new Error(
      "useClassroomRoadmap deve ser usado dentro de ClassroomRoadmapProvider",
    );
  }
  return ctx;
}

/** Fora da classroom (ex.: modal de curso), retorna null e o consumidor faz fetch próprio. */
export function useOptionalClassroomRoadmap(): ClassroomRoadmapContextValue | null {
  return useContext(ClassroomRoadmapContext);
}
