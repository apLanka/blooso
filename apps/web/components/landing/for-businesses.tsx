import Link from 'next/link';
import { Calendar, Users, Star, CreditCard, Clock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Clock,
    title: '24/7 online booking',
    description: "Let customers book anytime, even when you're closed.",
  },
  {
    icon: Calendar,
    title: 'Smart calendar',
    description: 'Manage staff schedules and avoid double-bookings.',
  },
  {
    icon: Users,
    title: 'Client database',
    description: 'Keep track of clients, preferences, and history.',
  },
  {
    icon: Star,
    title: 'Reviews & ratings',
    description: 'Build trust with verified reviews from real customers.',
  },
  {
    icon: CreditCard,
    title: 'Secure payments',
    description: 'Accept payments online with Stripe integration.',
  },
];

export function ForBusinesses() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Supercharge your salon, spa, or barbershop with the booking platform built for beauty
              & wellness professionals.
            </p>
            <ul className="mt-8 space-y-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-pink/10 text-accent-pink">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/register"
              className={cn(
                'mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold',
                'bg-gray-900 text-white',
                'transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.98]'
              )}
            >
              Start free
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent-blue-light/30">
                    <Check className="size-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">No credit card required</p>
                    <p className="text-sm text-gray-500">Get started in minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent-blue-light/30">
                    <Check className="size-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Free to start</p>
                    <p className="text-sm text-gray-500">Scale as you grow</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent-blue-light/30">
                    <Check className="size-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Trusted by 500+ businesses</p>
                    <p className="text-sm text-gray-500">Join the community</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent-pink/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-accent-blue/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
