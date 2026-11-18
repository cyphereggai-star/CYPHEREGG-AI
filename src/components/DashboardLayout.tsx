import { useState, type ReactNode } from 'react';
import {
  Terminal,
  History as HistoryIcon,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { TierBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRouter, type DashboardSection } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: typeof Terminal;
}

const NAV: NavItem[] = [
  { id: 'workspace', label: 'Workspace', icon: Terminal },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { route, navigate } = useRouter();
  const section =
    route.name === 'dashboard' ? route.section : ('workspace' as DashboardSection);
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast('Signed out', 'info');
    navigate({ name: 'landing' });
  };

  const go = (s: DashboardSection) => {
    setMobileOpen(false);
    navigate({ name: 'dashboard', section: s });
  };

  const initials = (profile?.full_name || user?.email || '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-cyber-border px-5">
        <button onClick={() => navigate({ name: 'landing' })}>
          <Logo size="sm" />
        </button>
        <button
          className="lg:hidden text-cyber-muted hover:text-cyber-text"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-cyber-muted">
          Menu
        </p>
        {NAV.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
                  : 'text-cyber-muted hover:bg-white/5 hover:text-cyber-text border border-transparent'
              }`}
            >
              <item.icon
                className={`h-[18px] w-[18px] ${active ? 'text-accent-blue' : ''}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="h-4 w-4 text-accent-blue" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-cyber-border p-3">
        <div className="rounded-lg border border-cyber-border bg-cyber-bg/40 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-green/20 text-sm font-semibold text-accent-blue border border-accent-blue/30">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-cyber-text">
                {profile?.full_name || 'User'}
              </p>
              <p className="truncate text-xs text-cyber-muted">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <TierBadge tier={profile?.tier ?? 'free'} />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-cyber-muted transition-colors hover:text-accent-danger"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cyber-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-cyber-border bg-cyber-surface/60 backdrop-blur-md lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in-fast"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-cyber-border bg-cyber-surface lg:hidden animate-slide-in-right">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-cyber-border glass px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-cyber-muted hover:text-cyber-text"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-cyber-text">{title}</h1>
              {subtitle && (
                <p className="text-xs text-cyber-muted">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ name: 'landing' })}
              leftIcon={<Home className="h-4 w-4" />}
              className="hidden sm:inline-flex"
            >
              Home
            </Button>
            <TierBadge tier={profile?.tier ?? 'free'} />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-5 sm:hidden">
            <h1 className="text-xl font-semibold text-cyber-text">{title}</h1>
            {subtitle && <p className="text-sm text-cyber-muted">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
