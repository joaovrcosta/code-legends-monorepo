import Link from "next/link";
import { Lightning } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { CtaBanner } from "./cta-banner";
import { cn } from "@/lib/utils";

export interface CtaUpgradeBannerProps {
  className?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
}

export function CtaUpgradeBanner({
  className,
  title = "Faça um upgrade",
  description = "Desbloqueie mais conteúdos, certificados e benefícios do seu plano.",
  ctaLabel = "Ver planos",
}: CtaUpgradeBannerProps) {
  return (
    <CtaBanner
      className={cn(className)}
      variant="default"
      icon={<Lightning size={24} weight="fill" />}
      title={title}
      description={description}
      action={
        <Button
          asChild
          variant="outline"
          className="h-[44px] w-full rounded-full border-[#25252A] bg-transparent px-6 text-sm font-medium text-white shadow-none hover:bg-[#25252A] hover:text-white sm:w-auto"
        >
          <Link href="/plans">{ctaLabel}</Link>
        </Button>
      }
    />
  );
}
