import { useEffect, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter, type DashboardSection } from '@/context/RouterContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { PricingPage } from '@/pages/PricingPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { InvestorsPage } from '@/pages/InvestorsPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { BillingPage } from '@/pages/BillingPage';
import { Logo } from '@/components/ui/Logo';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cyber-bg">
      <div className="animate-pulse-glow rounded-xl">
        <Logo size="lg" />
      </div>
      <div className="flex items-center gap-2 text-sm text-cyber-muted">
        <span className="h-2 w-2 animate-ping rounded-full bg-accent-blue" />
        Loading CypherEgg AI…
      </div>
    </div>
  );
}

function GuardedDashboard({ section }: { section: DashboardSection }) {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && !user && section !== 'workspace') {
      navigate({ name: 'login' });
    }
  }, [loading, user, navigate, section]);

  // Workspace is accessible to guests; other sections require auth
  if (loading && section !== 'workspace') return <FullScreenLoader />;
  if (!user && section !== 'workspace') return null;

  switch (section) {
    case 'workspace':
      return <WorkspacePage />;
    case 'history':
      return <HistoryPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'billing':
      return <BillingPage />;
  }
}

function ChatbotHost({ children }: { children: ReactNode }) {
  const { route } = useRouter();
  // show chatbot everywhere except auth screens
  const show = route.name !== 'login' && route.name !== 'signup';
  return (
    <>
      {children}
      {show && <ChatbotWidget />}
    </>
  );
}

function Routes() {
  const { route, navigate } = useRouter();
  const { user, loading } = useAuth();

  // redirect authenticated users away from login/signup
  useEffect(() => {
    if (
      !loading &&
      user &&
      (route.name === 'login' || route.name === 'signup')
    ) {
      navigate({ name: 'dashboard', section: 'workspace' });
    }
  }, [loading, user, route, navigate]);

  if (
    loading &&
    route.name !== 'landing' &&
    route.name !== 'pricing' &&
    route.name !== 'privacy' &&
    route.name !== 'terms' &&
    route.name !== 'investors' &&
    !(route.name === 'dashboard' && route.section === 'workspace')
  ) {
    return <FullScreenLoader />;
  }

  let page: ReactNode;
  switch (route.name) {
    case 'landing':
      page = <LandingPage />;
      break;
    case 'login':
      page = <AuthPage mode="login" />;
      break;
    case 'signup':
      page = <AuthPage mode="signup" />;
      break;
    case 'pricing':
      page = <PricingPage />;
      break;
    case 'privacy':
      page = <PrivacyPage />;
      break;
    case 'terms':
      page = <TermsPage />;
      break;
    case 'investors':
      page = <InvestorsPage />;
      break;
    case 'dashboard':
      page = <GuardedDashboard section={route.section} />;
      break;
    default:
      page = <LandingPage />;
  }

  return <ChatbotHost>{page}</ChatbotHost>;
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </RouterProvider>
    </AuthProvider>
  );
}
