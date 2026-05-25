const STATS = [
  { value: '500+', label: 'Partner Businesses' },
  { value: '10,000+', label: 'Appointments Booked' },
  { value: '4.9', label: 'Average Rating' },
  { value: '50+', label: 'Cities Covered' },
];

export function StatsSection() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ backgroundColor: 'var(--blooso-bg-warmer)' }}
      aria-label="Platform statistics"
    >
      <div className="blooso-container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-3xl font-bold tracking-tight md:text-4xl"
                style={{
                  color: i === 0 || i === 1 ? 'var(--blooso-rose)' : 'var(--blooso-text)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {stat.value}
              </p>
              <p
                className="mt-1.5 text-sm font-medium"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
