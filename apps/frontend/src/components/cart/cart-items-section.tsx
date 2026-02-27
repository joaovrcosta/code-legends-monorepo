"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, FileText } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PlanInfo } from "./constants";

interface CartItemsSectionProps {
  plan: PlanInfo;
}

export function CartItemsSection({ plan }: CartItemsSectionProps) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
        <FileText size={22} className="text-[#00C8FF]" />
        Meus itens
      </h2>

      <Card className="border-[#25252A] bg-[#1a1a1e] rounded-[20px] overflow-hidden">
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {plan.icon && (
                  <Image
                    src={plan.icon}
                    alt=""
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                )}
                <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                <span className="text-xs font-medium text-[#7e7e89] bg-[#25252A] px-2.5 py-1 rounded-full">
                  ACESSO ANUAL
                </span>
              </div>
              <p className="text-sm text-[#c4c4cc]">{plan.description}</p>
            </div>
            <div className="sm:text-right shrink-0">
              <p className="text-lg font-bold text-white">{plan.installments}</p>
              <p className="text-sm text-[#7e7e89]">{plan.price} à vista</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <p className="text-xs font-medium text-[#7e7e89] mb-3">Assine e receba:</p>
          <ul className="flex flex-col gap-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#c4c4cc]">
                <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#25252A] border border-[#00C8FF]/50 flex items-center justify-center">
                  <Check size={12} weight="bold" className="text-[#00C8FF]" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/learn/catalog"
            className="inline-block mt-4 text-sm font-medium text-[#00C8FF] hover:underline"
          >
            Saiba mais
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
