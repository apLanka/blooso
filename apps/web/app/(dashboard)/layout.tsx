export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Blooso</h1>
          <nav className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </a>
          </nav>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
