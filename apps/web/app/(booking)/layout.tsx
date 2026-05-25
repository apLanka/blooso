import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--blooso-bg)' }}>
      <LandingHeader alwaysSolid />
      <main className="flex-1 pt-[72px]">{children}</main>
      <LandingFooter />
    </div>
  );
}
