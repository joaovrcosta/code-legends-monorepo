import Image from "next/image";
import { heroContent } from "@/content/site";
import { Container } from "@/components/ui/container";
import { CtaButton } from "@/components/ui/cta-button";
import { TypingHeadline } from "@/components/marketing/typing-headline";

export function HeroSection() {
  const { instructor, video } = heroContent;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-16"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,200,255,0.15), transparent)",
        }}
      />

      <Container className="relative">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px] lg:gap-12">
          <div className="space-y-8">
            <TypingHeadline
              prefix={heroContent.headlinePrefix}
              highlight={heroContent.headlineHighlight}
              className="max-w-3xl text-3xl leading-tight text-landing md:text-5xl lg:text-[3.25rem]"
              id="hero-heading"
            />

            <p className="max-w-2xl text-base leading-relaxed text-landing-muted md:text-lg">
              {heroContent.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaButton href={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}
              </CtaButton>
              <CtaButton href={heroContent.secondaryCta.href} variant="secondary">
                {heroContent.secondaryCta.label}
              </CtaButton>
            </div>
          </div>

          <aside className="landing-card hidden p-4 lg:block">
            <div className="flex items-center gap-3">
              <Image
                src={instructor.avatar}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-landing">
                  {instructor.name}
                </p>
                <p className="text-xs text-landing-subtle">{instructor.role}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-landing-border bg-landing-surface shadow-2xl">
          <video
            className="aspect-video w-full bg-landing-surface-raised object-cover"
            controls
            preload="none"
            poster={video.poster}
          >
            <source src={video.src} type="video/mp4" />
            Seu navegador não suporta vídeos HTML5.
          </video>
        </div>
      </Container>
    </section>
  );
}
