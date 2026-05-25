import { Search, CalendarCheck, Smile } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Search',
    description:
      'Find salons, spas, and studios near you — filtered by service, rating, and availability.',
  },
  {
    icon: CalendarCheck,
    step: '02',
    title: 'Book',
    description:
      'Pick your service, stylist, and time slot. Instant confirmation, no phone calls needed.',
  },
  {
    icon: Smile,
    step: '03',
    title: 'Relax',
    description:
      'Show up and enjoy your experience. We handle reminders, payments, and everything else.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="blooso-section-pad"
      style={{ backgroundColor: 'var(--blooso-bg)' }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="blooso-container">
        {/* Section header */}
        <div className="mx-auto max-w-xl text-center">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--blooso-rose)' }}
          >
            Simple &amp; Fast
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            How It Works
          </h2>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--blooso-text-muted)' }}
          >
            Book your next appointment in three effortless steps.
          </p>
        </div>

        {/* Steps grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="group relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--blooso-bg-warm)',
                  border: '1px solid var(--blooso-border-light)',
                }}
              >
                {/* Step number */}
                <span
                  className="block text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--blooso-sand)' }}
                >
                  {step.step}
                </span>

                {/* Icon */}
                <div
                  className="mt-4 flex size-14 items-center justify-center rounded-xl transition-colors group-hover:scale-105"
                  style={{
                    backgroundColor: 'var(--blooso-rose-muted)',
                    color: 'var(--blooso-rose)',
                    transition: 'transform 250ms ease',
                  }}
                >
                  <Icon className="size-7" />
                </div>

                {/* Text */}
                <h3 className="mt-5 text-lg font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {step.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  {step.description}
                </p>

                {/* Connector arrow (hidden on last item) */}
                {index < STEPS.length - 1 && (
                  <div
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-lg font-light md:block"
                    style={{ color: 'var(--blooso-border)' }}
                    aria-hidden
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
