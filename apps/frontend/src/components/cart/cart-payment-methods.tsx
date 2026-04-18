"use client";

import { useEffect, useState } from "react";
import { CreditCard, Receipt, QrCode, Check, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { createCheckout } from "@/actions/payments/create-checkout";
import { Button } from "@/components/ui/button";

export type PaymentMethodId = "card" | "boleto" | "pix";

const METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ReactNode;
  discount?: string;
}> = [
  {
    id: "card",
    label: "Cartão de Crédito",
    description: "Parcele em até 12x",
    icon: <CreditCard size={24} weight="duotone" className="text-[#00C8FF]" />,
  },
  {
    id: "boleto",
    label: "Boleto",
    description: "Pague o valor à vista",
    icon: <Receipt size={24} weight="duotone" className="text-[#00C8FF]" />,
    discount: "10% OFF",
  },
  {
    id: "pix",
    label: "Pix",
    description: "Pague e libere o acesso no mesmo dia",
    icon: <QrCode size={24} weight="duotone" className="text-[#00C8FF]" />,
    discount: "10% OFF",
  },
];

interface CartPaymentMethodsProps {
  planSlug: string;
  value?: PaymentMethodId | null;
  onChange?: (method: PaymentMethodId) => void;
}

export function CartPayWithCardButton({ planSlug }: { planSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayWithCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const result = await createCheckout(planSlug, {
        returnUrl: `${origin}/cart/${planSlug}`,
        completionUrl: `${origin}/`,
      });
      if (result?.success && result.checkoutUrl) {
        sessionStorage.setItem("cl_pending_welcome", "1");
        window.location.href = result.checkoutUrl;
        return;
      }
      setError(
        !result
          ? "Erro ao criar checkout"
          : "message" in result
            ? result.message
            : "Erro ao criar checkout",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao redirecionar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handlePayWithCard}
        disabled={loading}
        className="w-full h-12 rounded-full bg-blue-gradient-500 hover:opacity-90 border-0 font-semibold text-sm"
      >
        {loading ? "Redirecionando..." : "Pagar com cartão"}
      </Button>
      {process.env.NODE_ENV === "development" && (
        <p className="text-xs text-[#7e7e89] text-center">
          Teste: use o cartão{" "}
          <strong className="text-[#c4c4cc]">4242 4242 4242 4242</strong>, validade futura e
          qualquer CVV.
        </p>
      )}
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}

export function CartPaymentMethods({ planSlug, value = null, onChange }: CartPaymentMethodsProps) {
  const [selected, setSelected] = useState<PaymentMethodId | null>(value ?? null);
  // (Desktop) o CTA de pagar fica na sidebar; aqui exibimos só no mobile.

  const handleSelect = (id: PaymentMethodId) => {
    setSelected(id);
    onChange?.(id);
  };

  useEffect(() => {
    setSelected(value ?? null);
  }, [value]);

  return (
    <div className="w-full min-w-0 space-y-4">
      <p className="text-xs font-medium text-[#7e7e89]">Compra nacional</p>

      <div className="space-y-2">
        {METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => handleSelect(method.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-[12px] border text-left transition-colors",
              "bg-[#25252A] border-[#25252A] hover:border-[#00C8FF]/50",
              selected === method.id && "border-[#00C8FF] ring-1 ring-[#00C8FF]/30"
            )}
          >
            <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
              {method.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm">{method.label}</span>
                {method.discount && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#00C8FF]/20 text-[#00C8FF]">
                    {method.discount}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7e7e89] mt-0.5">{method.description}</p>
            </div>
            <CaretRight size={18} className="text-[#7e7e89] shrink-0" />
          </button>
        ))}
      </div>

      {selected === "card" && (
        <div className="pt-2 lg:hidden">
          <CartPayWithCardButton planSlug={planSlug} />
        </div>
      )}

      <div className="flex items-center justify-center gap-2 pt-2">
        <Check size={18} weight="bold" className="text-[#00b37e]" />
        <span className="text-sm text-[#00b37e]">Suas informações estão seguras</span>
      </div>
    </div>
  );
}
