"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANOS } from "./constants";
import { CartHeader } from "./cart-header";
import { CartItemsSection } from "./cart-items-section";
import { CartCheckoutAccordion } from "./cart-checkout-accordion";
import { CartSummarySidebar } from "./cart-summary-sidebar";

interface CartContentProps {
  planSlug: string;
}

export function CartContent({ planSlug }: CartContentProps) {
  const plan = PLANOS[planSlug] ?? PLANOS.pro;
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleAvançar = () => {
    setAccordionValue("dados");
    setTimeout(() => {
      accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <CartHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <CartItemsSection plan={plan} />

          <CartCheckoutAccordion
            planSlug={planSlug}
            value={accordionValue}
            onValueChange={setAccordionValue}
            accordionRef={accordionRef}
          />

          <Button
            type="button"
            onClick={handleAvançar}
            className={cn(
              "w-full h-14 rounded-full text-base font-semibold",
              "bg-blue-gradient-500 hover:opacity-90 border-0"
            )}
          >
            Avançar
          </Button>
        </div>

        <div className="lg:col-span-1">
          <CartSummarySidebar plan={plan} />
        </div>
      </div>
    </div>
  );
}
