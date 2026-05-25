import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Blooso — Premium Booking for Beauty & Wellness',
    template: '%s | Blooso',
  },
  description:
    'Discover and book beauty & wellness services near you — salons, spas, barbershops, nail studios, and more — in seconds.',
  openGraph: {
    title: 'Blooso — Premium Booking for Beauty & Wellness',
    description:
      'Discover and book beauty & wellness services near you. Salons, spas, barbershops, and more.',
    type: 'website',
  },
  keywords: [
    'beauty booking',
    'salon booking',
    'spa appointment',
    'barbershop near me',
    'nail salon booking',
    'wellness booking',
    'beauty services',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geist.variable, playfair.variable)}>
      <body className={`${geist.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
