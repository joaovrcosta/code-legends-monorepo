"use client";

type TypingHeadlineProps = {
  prefix: string;
  highlight: string;
  className?: string;
  id?: string;
};

export function TypingHeadline({
  prefix,
  highlight,
  className,
  id,
}: TypingHeadlineProps) {
  return (
    <h1 id={id} className={className}>
      {prefix}{" "}
      <span className="landing-gradient-text font-bold">{highlight}</span>
      <span className="landing-typing-cursor text-landing-accent" aria-hidden>
        _
      </span>
    </h1>
  );
}
