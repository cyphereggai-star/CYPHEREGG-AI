import React, { createContext, useContext, useState, useEffect } from 'react';

export type Route =
  | { name: 'landing' }

  | { name: 'auth'; mode?: 'signin' | 'signup' }
  | { name: 'pricing' }
  | { name: 'privacy' }
  | { name: 'terms' }
  | { name: 'investors' }
  | { name: 'workspace' }

  | { name: 'dashboard'; section?: 'workspace' | 'history' | 'analytics' | 'billing' };

interface RouterContextType {
  route: Route;
  navigate: (to: Route) => void;
}

const RouterContext = createContext<RouterContextType>({
  route: { name: 'landing' },
  navigate: () => {},
});

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (!hash || hash === 'undefined') return { name: 'landing' };
  if (hash.startsWith('auth')) return { name: 'auth', mode: hash.includes('signup') ? 'signup' : 'signin' };
  if (hash.startsWith('pricing')) return { name: 'pricing' };
  if (hash.startsWith('privacy')) return { name: 'privacy' };
  if (hash.startsWith('terms')) return { name: 'terms' };
  if (hash.startsWith('investors')) return { name: 'investors' };
  if (hash.includes('history')) return { name: 'dashboard', section: 'history' };
  if (hash.includes('analytics')) return { name: 'dashboard', section: 'analytics' };
  if (hash.includes('billing')) return { name: 'dashboard', section: 'billing' };
  if (hash.includes('workspace') || hash.startsWith('dashboard')) return { name: 'dashboard', section: 'workspace' };
  return { name: 'landing' };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      if (window.location.hash.includes('undefined')) return;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: Route) => {
    setRoute(to);
    if (to.name === 'landing') window.location.hash = '/';
    else if (to.name === 'auth') window.location.hash = `/auth/${to.mode || 'signin'}`;
    else if (to.name === 'workspace') window.location.hash = '/dashboard/workspace';
    else if (to.name === 'dashboard') window.location.hash = `/dashboard/${to.section || 'workspace'}`;
    else window.location.hash = `/${to.name}`;
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
