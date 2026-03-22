import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'Blooso — Premium Booking for Beauty & Wellness',
    template: '%s | Blooso',
  },
  description: 'Book beauty and wellness services 24/7. Find salons, barbershops, and more.',
  openGraph: {
    title: 'Blooso — Premium Booking for Beauty & Wellness',
    description: 'Book beauty and wellness services 24/7',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className={`${geist.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
