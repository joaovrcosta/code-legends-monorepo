import Image from "next/image";
import { socialProofLogos } from "@/content/site";
import { Container } from "@/components/ui/container";

export function SocialProofBar() {
  return (
    <section aria-label="Empresas e tecnologias" className="border-y border-landing-border/60 py-8">
      <Container>
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-landing-subtle">
          Tecnologias que você vai dominar
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {socialProofLogos.map((logo) => (
            <li key={logo.name}>
              <Image
                src={logo.src}
                alt={logo.name}
                width={100}
                height={32}
                loading="lazy"
                className="h-6 w-auto opacity-50 grayscale transition-opacity hover:opacity-80 md:h-8"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
