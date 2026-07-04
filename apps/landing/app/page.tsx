import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialProofBar } from "@/components/sections/social-proof-bar";
import { CoursesSection } from "@/components/sections/courses-section";
import { PlatformFeaturesSection } from "@/components/sections/platform-features-section";
import { CultureCarouselSection } from "@/components/sections/culture-carousel-section";
import { TabbedFeaturesSection } from "@/components/sections/tabbed-features-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <SocialProofBar />
        <CoursesSection />
        <PlatformFeaturesSection />
        <CultureCarouselSection />
        <TabbedFeaturesSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
