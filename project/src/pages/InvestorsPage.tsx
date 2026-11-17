import { useState } from 'react';
import { ArrowLeft, TrendingUp, Mail, User as UserIcon, Building2, Send, Loader2, Check } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

const HIGHLIGHTS = [
  { label: 'Active Users', value: 'Growing' },
  { label: 'Revenue Model', value: 'SaaS + Crypto' },
  { label: 'Languages', value: '9' },
  { label: 'Vulnerability Classes', value: '25+' },
];

export function InvestorsPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const valid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.message.trim().length >= 10;

  const submit = async () => {
    if (!valid) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('investor_leads').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast('Could not submit inquiry — please try again', 'error');
      return;
    }
    setSubmitted(true);
    toast('Inquiry submitted — we will be in touch');
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <PublicNavbar />

      <div className="mx-auto max-w-4xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ name: 'landing' })}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-cyber-muted transition-colors hover:text-cyber-text"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="blue">
            <TrendingUp className="h-3 w-3" /> Investor Relations
          </Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Invest in the future of{' '}
            <span className="gradient-text">AI-powered security</span>
          </h1>
          <p className="mt-4 text-cyber-muted">
            CypherEgg AI is building the next generation of developer tooling —
            combining AI code generation with deep security analysis. We welcome
            conversations with accredited investors and strategic partners.
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <Card key={h.label} className="p-5 text-center">
              <p className="text-lg font-bold text-accent-blue">{h.value}</p>
              <p className="mt-1 text-xs text-cyber-muted">{h.label}</p>
            </Card>
          ))}
        </div>

        {/* Contact form */}
        <Card className="mt-10 p-7" glow>
          {submitted ? (
            <div className="py-8 text-center animate-scale-in">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10 shadow-glow-green">
                <Check className="h-8 w-8 text-accent-green" />
              </div>
              <h3 className="text-xl font-bold text-cyber-text">Thank you</h3>
              <p className="mt-2 text-sm text-cyber-muted">
                Your inquiry has been received. Our team will reach out within
                2-3 business days.
              </p>
              <Button
                className="mt-6"
                variant="secondary"
                onClick={() => navigate({ name: 'landing' })}
              >
                Back to home
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-cyber-text">
                  Get in touch
                </h2>
                <p className="mt-1 text-sm text-cyber-muted">
                  Tell us about your investment focus and interest in CypherEgg AI.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyber-dim">
                    Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-10 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyber-dim">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@vc.com"
                      className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-10 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyber-dim">
                  Company / Firm
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Sequoia, a16z, YC, …"
                    className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-10 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyber-dim">
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  placeholder="Tell us about your investment thesis and what interests you about CypherEgg AI…"
                  className="w-full resize-none rounded-lg border border-cyber-border bg-cyber-bg/60 p-3.5 text-sm text-cyber-text placeholder:text-cyber-muted/60 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                />
              </div>

              <Button
                fullWidth
                size="lg"
                loading={loading}
                disabled={!valid}
                onClick={submit}
                leftIcon={!loading ? <Send className="h-4 w-4" /> : undefined}
              >
                {loading ? 'Submitting…' : 'Submit Inquiry'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
