import { LandingHeader } from '@/components/landing/landing-header';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { CategoriesSection } from '@/components/landing/categories-section';
import { ReviewsSection } from '@/components/landing/reviews-section';
import { ForBusinesses } from '@/components/landing/for-businesses';
import { StatsSection } from '@/components/landing/stats-section';
import { FinalCta } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <Hero />
      <HowItWorks />
      <CategoriesSection />
      <ReviewsSection />
      <ForBusinesses />
      <StatsSection />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
