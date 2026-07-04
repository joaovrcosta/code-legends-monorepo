import Image from "next/image";
import { platformFeatures, platformSection } from "@/content/features";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

export function PlatformFeaturesSection() {
  const titleId = `${platformSection.id}-title`;

  return (
    <section
      id={platformSection.id}
      aria-labelledby={titleId}
      className="landing-section bg-landing-surface/40"
    >
      <Container className="space-y-14">
        <SectionHeading
          eyebrow={platformSection.eyebrow}
          title={platformSection.title}
          description={platformSection.description}
          titleId={titleId}
        />

        <div className="space-y-16 lg:space-y-24">
          {platformFeatures.map((feature, index) => (
            <article
              key={feature.id}
              className={cn(
                "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
                index % 2 === 1 && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-widest text-landing-accent">
                  {feature.step}
                </p>
                <h3 className="text-2xl font-semibold text-landing md:text-3xl">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-landing-muted">
                  {feature.description}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-landing-border bg-landing-surface-raised">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  width={640}
                  height={400}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
