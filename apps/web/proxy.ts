import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth redirects are handled client-side (AuthProvider + useAuth)
// since tokens are stored in localStorage. This proxy is a placeholder
// for future cookie-based auth or other route protection.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
