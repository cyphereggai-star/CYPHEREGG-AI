import { ArrowLeft, FileText, Cpu, CreditCard, ShieldAlert } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from '@/context/RouterContext';

export function TermsPage() {
  const { navigate } = useRouter();

  const sections = [
    {
      icon: Cpu,
      title: '1. Use of the Platform',
      body: 'CypherEgg AI provides an offline-capable, automated AI code generation and cybersecurity flaw detection environment. You agree to use these tools strictly for legal, educational, and authorized development practices. You are responsible for all activity that occurs under your account and must not use the platform to generate malicious code, attack systems you do not own, or violate any applicable laws.',
    },
    {
      icon: CreditCard,
      title: '2. Subscriptions & Billing',
      body: 'Our platform showcases Free, Pro ($19/mo), and Enterprise tiers. All active payment integrations or visual checkout layers operate securely under the defined subscription tier dynamics. Subscriptions can be upgraded, downgraded, or cancelled at any time from your Billing page. In this demo environment, no real payments are processed — the checkout flow is simulated for demonstration purposes.',
    },
    {
      icon: ShieldAlert,
      title: '3. Limitation of Liability',
      body: 'CypherEgg AI is an automated assistant. Security flaw detections and code snippets generated should be verified by professional developers before production deployment. The platform is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of generated code or security reports, including but not limited to direct, indirect, incidental, or consequential damages.',
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
          <Badge variant="green">
            <FileText className="h-3 w-3" /> Legal
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of{' '}
            <span className="gradient-text">Service</span>
          </h1>
          <p className="mt-3 text-sm text-cyber-muted">
            Last updated: November 2026
          </p>
          <p className="mt-4 text-cyber-muted">
            Welcome to CypherEgg AI. By accessing our platform, you agree to
            comply with the following terms.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((s) => (
            <Card key={s.title} className="p-6 animate-fade-in">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-green/20 bg-accent-green/10 text-accent-green">
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

          <Card className="p-6 border-accent-green/20">
            <div>
              <h2 className="text-lg font-semibold text-cyber-text">
                Contact & Legal Compliance
              </h2>
              <p className="mt-2 text-sm text-cyber-muted">
                For any legal compliance support, contact us via our official
                email channel:{' '}
                <a
                  href="mailto:cypheregg.ai@gmail.com"
                  className="text-accent-green hover:underline"
                >
                  cypheregg.ai@gmail.com
                </a>
              </p>
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
