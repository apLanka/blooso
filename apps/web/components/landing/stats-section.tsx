const STATS = [
  { value: '500+', label: 'Partner businesses' },
  { value: '10,000+', label: 'Bookings made' },
  { value: '4.9', label: 'Average rating' },
  { value: '50+', label: 'Cities covered' },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
