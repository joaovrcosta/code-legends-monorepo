"use client";

import * as React from "react";
import { ch } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface Instructor {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface InstructorSelectProps {
  instructors: Instructor[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  className?: string;
}

export function InstructorSelect({
  instructors,
  value,
  onChange,
  required,
  id,
  className,
}: InstructorSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());
  const selectRef = React.useRef<HTMLDivElement>(null);

  const selectedInstructor = instructors.find((inst) => inst.id === value);

  const handleImageError = (instructorId: string) => {
    setImageErrors((prev) => new Set(prev).add(instructorId));
  };

  const renderAvatar = (instructor: Instructor) => {
    if (instructor.avatar && !imageErrors.has(instructor.id)) {
      return (
        <img
          src={instructor.avatar}
          alt={instructor.name}
          className="h-6 w-6 rounded-full object-cover"
          onError={() => handleImageError(instructor.id)}
        />
      );
    }
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ch-border text-xs font-medium text-ch-muted">
        {instructor.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          ch.input,
          "items-center gap-3",
          !selectedInstructor && "text-ch-muted"
        )}
      >
        {selectedInstructor ? (
          <>
            {renderAvatar(selectedInstructor)}
            <span className="flex-1 text-left">{selectedInstructor.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-ch-muted">Selecione um instrutor</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ch-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className={cn(ch.surface, "absolute z-50 mt-1 max-h-60 w-full overflow-auto shadow-lg")}>
          {instructors.length === 0 ? (
            <div className="px-3 py-2 text-sm text-ch-muted">
              Nenhum instrutor disponível
            </div>
          ) : (
            instructors.map((instructor) => (
              <button
                key={instructor.id}
                type="button"
                onClick={() => {
                  onChange(instructor.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-sm text-ch transition-colors hover:bg-ch-surface-raised",
                  value === instructor.id && "bg-ch-accent-soft"
                )}
              >
                {renderAvatar(instructor)}
                <span className="flex-1 text-left">{instructor.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {required && !value && (
        <input
          type="text"
          required
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
          value=""
          onChange={() => {}}
        />
      )}
    </div>
  );
}
