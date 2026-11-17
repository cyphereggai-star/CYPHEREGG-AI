import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

export function PublicNavbar() {
  const { navigate, route } = useRouter();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', target: 'features' },
    { label: 'Workspace', target: 'product' },
    { label: 'Pricing', action: () => navigate({ name: 'pricing' }) },
  ];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-cyber-border'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate({ name: 'landing' })} className="shrink-0">
          <Logo />
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.action ? (
              <button
                key={l.label}
                onClick={l.action}
                className="text-sm font-medium text-cyber-muted transition-colors hover:text-cyber-text"
              >
                {l.label}
              </button>
            ) : (
              <button
                key={l.label}
                onClick={() => scrollTo(l.target!)}
                className="text-sm font-medium text-cyber-muted transition-colors hover:text-cyber-text"
              >
                {l.label}
              </button>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button
              size="sm"
              onClick={() =>
                navigate({ name: 'dashboard', section: 'workspace' })
              }
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ name: 'login' })}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ name: 'signup' })}
                leftIcon={<span className="text-base leading-none">→</span>}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-md p-2 text-cyber-text"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-cyber-border glass animate-fade-in-fast">
          <div className="space-y-1 px-4 py-4">
            {links.map((l) =>
              l.action ? (
                <button
                  key={l.label}
                  onClick={() => {
                    l.action!();
                    setMobileOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-cyber-dim hover:bg-white/5"
                >
                  {l.label}
                </button>
              ) : (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.target!)}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-cyber-dim hover:bg-white/5"
                >
                  {l.label}
                </button>
              )
            )}
            <div className="flex flex-col gap-2 pt-3">
              {user ? (
                <Button
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    navigate({ name: 'dashboard', section: 'workspace' });
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ name: 'login' });
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ name: 'signup' });
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
