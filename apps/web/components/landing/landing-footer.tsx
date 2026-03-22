import Link from 'next/link';

const FOOTER_LINKS = {
  Product: [
    { href: '/search', label: 'Find a business' },
    { href: '/register', label: 'For businesses' },
  ],
  Company: [
    { href: '/login', label: 'Sign in' },
    { href: '/register', label: 'Sign up' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
              Blooso
            </Link>
            <p className="mt-3 max-w-sm text-sm text-gray-500">
              Premium booking platform for beauty & wellness. Find salons and barbershops. Book in
              minutes.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Product</h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.Product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.Company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Blooso. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
