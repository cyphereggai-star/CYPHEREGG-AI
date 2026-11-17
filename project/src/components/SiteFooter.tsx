import { useState, type ReactNode } from 'react';
import { ShieldCheck, FileText, TrendingUp, ArrowLeft, Lock, Database, ChartBar as BarChart3, Mail, User as UserIcon, Building as Building2, Send, Loader as Loader2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { sanitizeText, isValidEmail } from '@/lib/sanitize';

type ModalKind = 'privacy' | 'terms' | 'investors' | null;

export function SiteFooter() {
  const [open, setOpen] = useState<ModalKind>(null);

  return (
    <>
      <footer className="border-t border-cyber-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-cyber-muted">
            <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            All systems operational
          </div>
          <div className="flex items-center gap-5 text-sm text-cyber-muted">
            <button
              onClick={() => setOpen('privacy')}
              className="transition-colors hover:text-cyber-text"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setOpen('terms')}
              className="transition-colors hover:text-cyber-text"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setOpen('investors')}
              className="transition-colors hover:text-cyber-text"
            >
              Investor Relations
            </button>
          </div>
          <p className="text-sm text-cyber-muted">
            &copy; {new Date().getFullYear()} CypherEgg AI &middot; Built for the future
          </p>
        </div>
      </footer>

      <PrivacyModal open={open === 'privacy'} onClose={() => setOpen(null)} />
      <TermsModal open={open === 'terms'} onClose={() => setOpen(null)} />
      <InvestorsModal open={open === 'investors'} onClose={() => setOpen(null)} />
    </>
  );
}

function ModalShell({
  open,
  onClose,
  badge,
  title,
  updated,
  children,
}: {
  open: boolean;
  onClose: () => void;
  badge: ReactNode;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <span className="flex items-center gap-2">{badge} {title}</span>
      }
      subtitle={`Last updated: ${updated}`}
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {children}
      </div>
    </Modal>
  );
}

function Section({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-bg/30 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue/10 text-accent-blue">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-cyber-text">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-cyber-muted">{body}</p>
    </div>
  );
}

function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      badge={<Badge variant="blue"><ShieldCheck className="h-3 w-3" /> Legal</Badge>}
      title="Privacy Policy"
      updated="November 2026"
    >
      <Section
        icon={<ShieldCheck className="h-4 w-4" />}
        title="1. Data Security & AI Core"
        body="CypherEgg AI operates with a secure, built-in intelligent framework. Any source code you input is processed securely by the offline engine. We do not store, sell, or share your proprietary code with any third-party services. All AI processing happens locally in your browser — no external API calls are made."
      />
      <Section
        icon={<Lock className="h-4 w-4" />}
        title="2. Account Information"
        body="Your profile data is managed securely via Supabase Auth with row-level security at the database level. Passwords are hashed with modern key-derivation functions and never stored in plaintext. Your session is encrypted and protected."
      />
      <Section
        icon={<BarChart3 className="h-4 w-4" />}
        title="3. Analytics"
        body="We use lightweight, non-invasive analytical tools to monitor platform performance. These analytics are aggregated and do not identify individual users. Your generation history and prompts are private to your account and never used for analytics."
      />
      <Section
        icon={<Database className="h-4 w-4" />}
        title="4. Data Retention"
        body="Your generation history is stored securely and is only accessible to you. Free plan history is retained for 7 days; Pro and Enterprise plans retain history indefinitely. You may delete any or all of your history at any time from the History page."
      />
      <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/5 p-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-accent-blue" />
          <h3 className="text-sm font-semibold text-cyber-text">Contact Us</h3>
        </div>
        <p className="mt-1.5 text-sm text-cyber-muted">
          For privacy inquiries, contact{' '}
          <a href="mailto:privacy@cypheregg.ai" className="text-accent-blue hover:underline">
            privacy@cypheregg.ai
          </a>
        </p>
      </div>
    </ModalShell>
  );
}

function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      badge={<Badge variant="green"><FileText className="h-3 w-3" /> Legal</Badge>}
      title="Terms of Service"
      updated="November 2026"
    >
      <Section
        icon={<FileText className="h-4 w-4" />}
        title="1. Use of the Platform"
        body="CypherEgg AI provides an automated AI code generation and cybersecurity flaw detection environment. You agree to use these tools strictly for legal, educational, and authorized development practices. You are responsible for all activity under your account."
      />
      <Section
        icon={<Database className="h-4 w-4" />}
        title="2. Subscriptions & Billing"
        body="We offer Free, Pro ($19/mo in USDT/TRC20), and Enterprise ($49/mo) tiers. Subscriptions can be upgraded, downgraded, or cancelled at any time. Pro upgrade crypto payments are recorded with status 'pending' for admin audit before activation."
      />
      <Section
        icon={<ShieldCheck className="h-4 w-4" />}
        title="3. Limitation of Liability"
        body="CypherEgg AI is an automated assistant. Security findings and code snippets should be verified by professional developers before production deployment. The platform is provided 'as is' without warranties of any kind."
      />
      <div className="rounded-lg border border-accent-green/20 bg-accent-green/5 p-4">
        <h3 className="text-sm font-semibold text-cyber-text">Contact &amp; Legal Compliance</h3>
        <p className="mt-1.5 text-sm text-cyber-muted">
          For legal inquiries, contact{' '}
          <a href="mailto:legal@cypheregg.ai" className="text-accent-green hover:underline">
            legal@cypheregg.ai
          </a>
        </p>
      </div>
    </ModalShell>
  );
}

function InvestorsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const valid =
    form.name.trim().length >= 2 &&
    isValidEmail(form.email) &&
    form.message.trim().length >= 10;

  const submit = async () => {
    if (!valid) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('investor_leads').insert({
      name: sanitizeText(form.name, 200),
      email: sanitizeText(form.email, 200),
      company: form.company.trim() ? sanitizeText(form.company, 200) : null,
      message: sanitizeText(form.message, 2000),
    });
    setLoading(false);
    if (error) {
      toast('Could not submit inquiry — please try again', 'error');
      return;
    }
    setSubmitted(true);
    toast('Inquiry submitted — we will be in touch');
  };

  const close = () => {
    if (!loading) {
      setSubmitted(false);
      setForm({ name: '', email: '', company: '', message: '' });
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      maxWidth="max-w-lg"
      title={
        submitted ? undefined : (
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-blue" />
            Investor Relations
          </span>
        )
      }
      subtitle={submitted ? undefined : 'Tell us about your investment interest in CypherEgg AI'}
    >
      {submitted ? (
        <div className="py-6 text-center animate-scale-in">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10">
            <Check className="h-7 w-7 text-accent-green" />
          </div>
          <h3 className="text-lg font-semibold text-cyber-text">Thank you</h3>
          <p className="mt-2 text-sm text-cyber-muted">
            Your inquiry has been received. Our team will reach out within 2-3 business days.
          </p>
          <Button className="mt-5" variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-cyber-muted">
            CypherEgg AI is building the next generation of developer tooling — combining AI code generation with deep security analysis. We welcome conversations with accredited investors and strategic partners.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-cyber-muted">Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  maxLength={200}
                  className="h-10 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-9 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cyber-muted">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@vc.com"
                  maxLength={200}
                  className="h-10 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-9 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-cyber-muted">Company / Firm</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Sequoia, a16z, YC, …"
                maxLength={200}
                className="h-10 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-9 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-cyber-muted">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              maxLength={2000}
              placeholder="Tell us about your investment thesis and interest in CypherEgg AI…"
              className="w-full resize-none rounded-lg border border-cyber-border bg-cyber-bg/60 p-3 text-sm text-cyber-text placeholder:text-cyber-muted/60 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
            />
          </div>
          <Button
            fullWidth
            loading={loading}
            disabled={!valid}
            onClick={submit}
            leftIcon={!loading ? <Send className="h-4 w-4" /> : undefined}
          >
            {loading ? 'Submitting…' : 'Submit Inquiry'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
