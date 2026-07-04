import { footerLinks } from "@/content/site";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-landing-border bg-landing-surface py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-landing">Code Legends</p>
            <p className="max-w-xs text-sm text-landing-muted">
              Plataforma de educação em programação para quem quer se tornar
              lendário no mercado tech.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-landing-subtle">
              Produto
            </p>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-landing-muted hover:text-landing"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-landing-subtle">
              Legal
            </p>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-landing-muted hover:text-landing"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-landing-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-landing-subtle">
            © {year} Code Legends. Todos os direitos reservados.
          </p>
          <ul className="flex flex-wrap gap-4">
            {footerLinks.social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-landing-muted hover:text-landing-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
