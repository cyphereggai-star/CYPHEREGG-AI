import { ArrowLeft, ShieldCheck, Lock, Database, BarChart3, Mail } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from '@/context/RouterContext';

export function PrivacyPage() {
  const { navigate } = useRouter();

  const sections = [
    {
      icon: ShieldCheck,
      title: '1. Data Security & AI Core',
      body: 'CypherEgg AI operates with a secure, built-in intelligent framework. Any source code you input into the AI Generator or Security Vulnerability Analyzer is processed securely by the offline engine. We do not store, sell, or share your proprietary code with any third-party services. All AI processing happens locally in your browser — no external API calls are made.',
    },
    {
      icon: Lock,
      title: '2. Account Information',
      body: 'When you create an account, your profile data is managed securely via the built-in database configuration, ensuring complete privacy and standard authentication guardrails. Passwords are hashed with modern key-derivation functions and never stored in plaintext. Your session is encrypted and protected by row-level security at the database level.',
    },
    {
      icon: BarChart3,
      title: '3. Analytics',
      body: 'We may use lightweight, non-invasive analytical tools to monitor platform performance and traffic orientation to improve our software responsiveness. These analytics are aggregated and do not identify individual users. Your generation history and prompts are private to your account and never used for analytics.',
    },
    {
      icon: Database,
      title: '4. Data Retention',
      body: 'Your generation history is stored securely and is only accessible to you through your authenticated session. Free plan history is retained for 7 days; Pro and Enterprise plans retain history indefinitely. You may delete any or all of your history at any time from the History page.',
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <PublicNavbar />

      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ name: 'landing' })}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-cyber-muted transition-colors hover:text-cyber-text"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="mb-8">
          <Badge variant="blue">
            <ShieldCheck className="h-3 w-3" /> Legal
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy{' '}
            <span className="gradient-text">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-cyber-muted">
            Last updated: November 2026
          </p>
          <p className="mt-4 text-cyber-muted">
            At CypherEgg AI, we are committed to protecting your privacy. This
            Privacy Policy explains how we handle your information.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((s) => (
            <Card key={s.title} className="p-6 animate-fade-in">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue/10 text-accent-blue">
                  <s.icon className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-lg font-semibold text-cyber-text">
                  {s.title}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-cyber-muted">
                {s.body}
              </p>
            </Card>
          ))}

          <Card className="p-6 border-accent-blue/20">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent-blue" />
              <div>
                <h2 className="text-lg font-semibold text-cyber-text">
                  Contact Us
                </h2>
                <p className="mt-1 text-sm text-cyber-muted">
                  For privacy inquiries, contact:{' '}
                  <a
                    href="mailto:privacy@cypheregg.ai"
                    className="text-accent-blue hover:underline"
                  >
                    privacy@cypheregg.ai
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-cyber-muted">
          © {new Date().getFullYear()} CypherEgg AI · All rights reserved
        </p>
      </div>
    </div>
  );
}
