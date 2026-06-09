import { Navbar } from '@/components/layout/navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--blooso-bg)' }}>
      <Navbar alwaysSolid />
      <main className="flex-1 pt-[72px]">{children}</main>
      <LandingFooter />
    </div>
  );
}
