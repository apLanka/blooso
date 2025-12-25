import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Blooso</h1>
      <p className="text-muted-foreground">Premium booking platform for beauty & wellness</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
