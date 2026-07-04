"use client";

import { useState } from "react";
import Image from "next/image";
import { tabItems, tabsSection } from "@/content/tabs";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaButton } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";

export function TabbedFeaturesSection() {
  const [activeId, setActiveId] = useState(tabItems[0].id);
  const activeTab = tabItems.find((tab) => tab.id === activeId) ?? tabItems[0];
  const titleId = `${tabsSection.id}-title`;

  return (
    <section
      id={tabsSection.id}
      aria-labelledby={titleId}
      className="landing-section bg-landing-surface/40"
    >
      <Container className="space-y-10">
        <SectionHeading
          eyebrow={tabsSection.eyebrow}
          title={tabsSection.title}
          titleId={titleId}
          align="center"
          className="mx-auto"
        />

        <div
          role="tablist"
          aria-label="Recursos da plataforma"
          className="flex flex-wrap justify-center gap-2 border-b border-landing-border pb-4"
        >
          {tabItems.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors md:text-sm",
                  isActive
                    ? "bg-landing-accent-soft text-landing-accent"
                    : "text-landing-subtle hover:text-landing-muted",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-landing md:text-3xl">
              {activeTab.title}
              <span className="landing-typing-cursor text-landing-accent">
                _
              </span>
            </h3>
            <p className="text-base leading-relaxed text-landing-muted">
              {activeTab.description}
            </p>
            <CtaButton href={activeTab.ctaHref}>{activeTab.ctaLabel}</CtaButton>
          </div>

          <div className="overflow-hidden rounded-2xl border border-landing-border bg-landing-surface-raised">
            {activeTab.media.type === "video" ? (
              <video
                className="aspect-video w-full object-cover"
                controls
                preload="none"
                poster={activeTab.media.poster}
              >
                <source src={activeTab.media.src} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={activeTab.media.src}
                alt={activeTab.media.alt}
                width={640}
                height={400}
                loading="lazy"
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
