"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatVideoDurationMask } from "@/lib/video-duration-mask";

export interface VideoDurationInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  value: string;
  onChange: (value: string) => void;
}

const VideoDurationInput = React.forwardRef<
  HTMLInputElement,
  VideoDurationInputProps
>(({ className, value, onChange, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9:]*"
      autoComplete="off"
      spellCheck={false}
      maxLength={8}
      placeholder="00:00:00"
      title="Duração em horas, minutos e segundos. Digite só números; os dois últimos são segundos, os dois anteriores minutos (máx. 59) e o restante horas."
      className={cn(
        "font-mono tabular-nums tracking-wide placeholder:tracking-normal",
        className
      )}
      value={value}
      onChange={(e) => onChange(formatVideoDurationMask(e.target.value))}
      {...props}
    />
  );
});
VideoDurationInput.displayName = "VideoDurationInput";

export { VideoDurationInput };
