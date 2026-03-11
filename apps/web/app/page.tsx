import { LandingHeader } from '@/components/landing/landing-header';
import { Hero } from '@/components/landing/hero';

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <Hero />
    </main>
  );
}
