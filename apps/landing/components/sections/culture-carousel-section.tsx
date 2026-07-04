import Image from "next/image";
import { cultureSection, cultureSlides } from "@/content/culture-slides";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function CultureCarouselSection() {
  const titleId = `${cultureSection.id}-title`;

  return (
    <section
      id={cultureSection.id}
      aria-labelledby={titleId}
      className="landing-section overflow-hidden"
    >
      <Container className="space-y-10">
        <SectionHeading
          eyebrow={cultureSection.eyebrow}
          title={cultureSection.title}
          description={cultureSection.description}
          titleId={titleId}
        />

        <div className="landing-carousel pb-2">
          {cultureSlides.map((slide) => (
            <article
              key={slide.id}
              className="landing-carousel-item landing-card overflow-hidden"
            >
              <div className="relative aspect-[16/10] bg-landing-orange/20">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
              <div className="space-y-2 p-6">
                <h3 className="text-xl font-semibold text-landing">
                  {slide.title}
                </h3>
                <p className="text-sm leading-relaxed text-landing-muted">
                  {slide.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
