import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'signup' }
  | { name: 'pricing' }
  | { name: 'privacy' }
  | { name: 'terms' }
  | { name: 'investors' }
  | { name: 'dashboard'; section: DashboardSection }
  | { name: 'workspace' };

export type DashboardSection =
  | 'workspace'
  | 'history'
  | 'analytics'
  | 'billing';

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [seg, section] = hash.split('/');
  if (seg === 'login') return { name: 'login' };
  if (seg === 'signup') return { name: 'signup' };
  if (seg === 'pricing') return { name: 'pricing' };
  if (seg === 'privacy') return { name: 'privacy' };
  if (seg === 'terms') return { name: 'terms' };
  if (seg === 'investors') return { name: 'investors' };
  if (seg === 'dashboard') {
    const valid: DashboardSection[] = [
      'workspace',
      'history',
      'analytics',
      'billing',
    ];
    const s = (section as DashboardSection) ?? 'workspace';
    return {
      name: 'dashboard',
      section: valid.includes(s) ? s : 'workspace',
    };
  }
  return { name: 'landing' };
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'landing':
      return '#/';
    case 'login':
      return '#/login';
    case 'signup':
      return '#/signup';
    case 'pricing':
      return '#/pricing';
    case 'privacy':
      return '#/privacy';
    case 'terms':
      return '#/terms';
    case 'investors':
      return '#/investors';
    case 'dashboard':
      return `#/dashboard/${route.section}`;
    case 'workspace':
      return '#/dashboard/workspace';
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(next);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
