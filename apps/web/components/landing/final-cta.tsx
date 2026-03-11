import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-transparent to-accent-blue/5" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Ready to book or grow your business?
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Join thousands of customers and businesses already using Blooso
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/search"
            className={cn(
              'group inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold',
              'bg-gray-900 text-white',
              'transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.98]'
            )}
          >
            Find a business
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/register"
            className={cn(
              'inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold',
              'border border-gray-200 text-gray-700 bg-white',
              'transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'
            )}
          >
            Register your business
          </Link>
        </div>
      </div>
    </section>
  );
}
