import Image from "next/image";
import Link from "next/link";
import { navLinks } from "@/content/site";
import { appPath } from "@/lib/env";
import { Container } from "@/components/ui/container";
import { CtaButton } from "@/components/ui/cta-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-landing-border/60 bg-landing-canvas/90 backdrop-blur-md">
      <Container as="nav" aria-label="Principal">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[72px]">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/code-legends-logo.svg"
              alt="Code Legends"
              width={212}
              height={32}
              priority
              className="h-7 w-[212px] md:h-8"
            />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-landing-muted transition-colors hover:text-landing"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <CtaButton href={appPath("/signup")} className="shrink-0">
            Quero ser uma lenda
          </CtaButton>
        </div>
      </Container>
    </header>
  );
}
