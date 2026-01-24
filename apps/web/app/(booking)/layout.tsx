export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <a href="/" className="font-semibold">
            Blooso
          </a>
          <a href="/search" className="text-sm text-muted-foreground hover:text-foreground">
            Find a business
          </a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
