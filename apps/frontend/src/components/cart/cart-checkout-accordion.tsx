"use client";

import { CaretDown, User, CreditCard } from "@phosphor-icons/react/dist/ssr";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CartMeusDadosFormHandle } from "./cart-meus-dados-form";
import { CartMeusDadosForm } from "./cart-meus-dados-form";
import type { PaymentMethodId } from "./cart-payment-methods";
import { CartPaymentMethods } from "./cart-payment-methods";

interface CartCheckoutAccordionProps {
  planSlug: string;
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  accordionRef: React.RefObject<HTMLDivElement | null>;
  meusDadosFormRef: React.RefObject<CartMeusDadosFormHandle | null>;
  onMeusDadosValidityChange?: (isValid: boolean) => void;
  selectedPaymentMethod: PaymentMethodId | null;
  onSelectedPaymentMethodChange: (method: PaymentMethodId) => void;
  checkoutDisabled?: boolean;
}

const TRIGGER_CLASS =
  "text-white hover:no-underline hover:text-[#c4c4cc] py-4 [&[data-state=open]_svg]:rotate-180";
const ITEM_CLASS =
  "border border-[#25252A] rounded-[12px] bg-gray-gradient px-4";

export function CartCheckoutAccordion({
  planSlug,
  value,
  onValueChange,
  accordionRef,
  meusDadosFormRef,
  onMeusDadosValidityChange,
  selectedPaymentMethod,
  onSelectedPaymentMethodChange,
  checkoutDisabled = false,
}: CartCheckoutAccordionProps) {
  return (
    <div ref={accordionRef}>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={onValueChange}
        className="space-y-2"
      >
        <AccordionItem value="dados" className={ITEM_CLASS}>
          <AccordionTrigger className={TRIGGER_CLASS}>
            <span className="flex items-center gap-2">
              <User size={20} className="text-[#00C8FF]" />
              Meus dados
            </span>
            <CaretDown
              size={18}
              className="text-[#7e7e89] shrink-0 transition-transform duration-200"
            />
          </AccordionTrigger>
          <AccordionContent className="w-full pb-6 pt-0">
            <CartMeusDadosForm
              ref={meusDadosFormRef}
              isOpen={value === "dados"}
              onAdvanceToPayment={() => onValueChange("pagamento")}
              showInternalAdvanceButton={false}
              onValidityChange={onMeusDadosValidityChange}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pagamento" className={ITEM_CLASS}>
          <AccordionTrigger className={TRIGGER_CLASS}>
            <span className="flex items-center gap-2">
              <CreditCard size={20} className="text-[#00C8FF]" />
              Informações de pagamento
            </span>
            <CaretDown
              size={18}
              className="text-[#7e7e89] shrink-0 transition-transform duration-200"
            />
          </AccordionTrigger>
          <AccordionContent className="w-full pb-6 pt-0">
            <CartPaymentMethods
              planSlug={planSlug}
              value={selectedPaymentMethod}
              onChange={onSelectedPaymentMethodChange}
              disabled={checkoutDisabled}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
