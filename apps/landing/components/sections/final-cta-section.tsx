import Image from "next/image";
import { finalCtaContent } from "@/content/site";
import { Container } from "@/components/ui/container";
import { CtaButton } from "@/components/ui/cta-button";

export function FinalCtaSection() {
  return (
    <section aria-labelledby="final-cta-title" className="landing-section">
      <Container>
        <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-landing-border md:min-h-[320px]">
          <Image
            src={finalCtaContent.backgroundImage}
            alt=""
            fill
            loading="lazy"
            className="object-cover opacity-40"
            aria-hidden
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-landing-canvas via-landing-canvas/90 to-transparent" />

          <div className="relative max-w-xl space-y-6 p-8 md:p-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-landing-accent-soft">
              <span className="text-lg text-landing-accent" aria-hidden>
                ◆
              </span>
            </div>
            <h2
              id="final-cta-title"
              className="text-2xl font-semibold text-landing md:text-3xl"
            >
              {finalCtaContent.title}
            </h2>
            <p className="text-base leading-relaxed text-landing-muted">
              {finalCtaContent.description}
            </p>
            <CtaButton href={finalCtaContent.cta.href}>
              {finalCtaContent.cta.label}
            </CtaButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
