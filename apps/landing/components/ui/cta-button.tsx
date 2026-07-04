import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  className,
  external,
}: CtaButtonProps) {
  const classes = cn(
    "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-accent",
    variant === "primary" &&
      "border border-landing-border text-white [background:var(--landing-gradient-cta)] shadow-lg",
    variant === "secondary" &&
      "border border-landing-border bg-landing-surface text-landing hover:bg-landing-surface-raised",
    variant === "ghost" && "text-landing-muted hover:text-landing",
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  if (href.startsWith("#") || href.startsWith("http")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
