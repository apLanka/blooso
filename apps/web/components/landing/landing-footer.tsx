import Link from 'next/link';

const FOOTER_LINKS = {
  'For Customers': [
    { href: '/search', label: 'Find a Service' },
    { href: '/search?category=hair', label: 'Hair & Styling' },
    { href: '/search?category=spa', label: 'Massage & Spa' },
    { href: '/search?category=nails', label: 'Nail Care' },
  ],
  'For Businesses': [
    { href: '/register', label: 'List Your Business' },
    { href: '/register', label: 'Pricing' },
    { href: '/register', label: 'Business Login' },
  ],
  Support: [
    { href: '/login', label: 'Help Centre' },
    { href: '/login', label: 'Privacy Policy' },
    { href: '/login', label: 'Terms of Service' },
  ],
};

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIALS = [
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'X (Twitter)', href: '#', Icon: XIcon },
];

export function LandingFooter() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: '#fff' }} aria-label="Site footer">
      <div className="blooso-container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-serif)' }}
              aria-label="Blooso home"
            >
              Blooso
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: '#9C9490' }}>
              Premium booking for beauty &amp; wellness.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: '#9C9490' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold text-white">{group}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: '#9C9490' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs" style={{ color: '#6B6460' }}>
            &copy; {new Date().getFullYear()} Blooso. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-xs transition-colors hover:text-white"
              style={{ color: '#6B6460' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/login"
              className="text-xs transition-colors hover:text-white"
              style={{ color: '#6B6460' }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
