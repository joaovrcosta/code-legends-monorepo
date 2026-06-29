"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewCourseDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button onClick={() => setOpen((v) => !v)}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Curso
        <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-ch-border bg-ch-surface py-1 shadow-lg">
          <Link
            href="/courses/new"
            className="block px-4 py-2 text-sm text-ch hover:bg-ch-surface-raised"
            onClick={() => setOpen(false)}
          >
            Criar curso
          </Link>
          <Link
            href="/courses/new?kind=path_unit"
            className="block px-4 py-2 text-sm text-ch hover:bg-ch-surface-raised"
            onClick={() => setOpen(false)}
          >
            Criar Unidade
          </Link>
        </div>
      )}
    </div>
  );
}
