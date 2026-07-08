"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  formatCentsToBRLMask,
  parseBRLInputToCents,
} from "@/lib/currency-mask";

type PlanPriceInputProps = {
  id?: string;
  valueCents: number;
  onChange: (cents: number) => void;
  required?: boolean;
  placeholder?: string;
};

export function PlanPriceInput({
  id,
  valueCents,
  onChange,
  required,
  placeholder = "R$ 0,00",
}: PlanPriceInputProps) {
  const [display, setDisplay] = useState(() =>
    formatCentsToBRLMask(valueCents),
  );

  useEffect(() => {
    setDisplay(formatCentsToBRLMask(valueCents));
  }, [valueCents]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cents = parseBRLInputToCents(event.target.value);
    onChange(cents);
    setDisplay(formatCentsToBRLMask(cents));
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
    />
  );
}
