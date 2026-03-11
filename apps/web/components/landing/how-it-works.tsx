import { Search, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Search,
    title: 'Search & discover',
    description:
      'Find salons, spas, and barbershops by name or category. Browse reviews and ratings.',
  },
  {
    icon: Calendar,
    title: 'Choose your time',
    description:
      'Pick your preferred date and time. See real-time availability and select your staff.',
  },
  {
    icon: CreditCard,
    title: 'Book & pay',
    description: 'Confirm your appointment and pay securely online. Get instant confirmation.',
  },
  {
    icon: CheckCircle,
    title: 'Enjoy your visit',
    description: 'Receive reminders and show up for your appointment. Leave a review after.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            How it works
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-gray-500">
            Book your next appointment in four simple steps
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-gray-900 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div
                  className={cn(
                    'mt-4 flex size-14 items-center justify-center rounded-xl',
                    'bg-accent-blue-light/30 text-accent-blue'
                  )}
                >
                  <Icon className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
