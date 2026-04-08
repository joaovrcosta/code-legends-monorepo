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
      autoComplete="off"
      spellCheck={false}
      placeholder="mm:ss ou h:mm:ss"
      title="Minutos e segundos (mm:ss) ou horas (h:mm:ss). Digite só números."
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
