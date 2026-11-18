import { useState } from 'react';
import { Check, Zap, Crown, Rocket, ArrowLeft, Lock, CreditCard, Sparkles, Bitcoin } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CryptoCheckoutModal } from '@/components/CryptoCheckoutModal';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import type { Tier } from '@/lib/types';

interface Plan {
  id: Tier;
  name: string;
  price: number;
  tagline: string;
  icon: typeof Zap;
  features: string[];
  highlight?: boolean;
  cta: string;
  crypto?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    tagline: 'Explore the workspace',
    icon: Sparkles,
    features: [
      '10 generations / month',
      'Code generation (3 languages)',
      'Basic security analysis',
      '7-day history',
    ],
    cta: 'Start Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    tagline: 'For active developers',
    icon: Zap,
    features: [
      'Unlimited generations',
      'All 9 languages',
      'Full CWE-mapped security reports',
      'Unlimited history + analytics',
      'Priority generation speed',
      'Email support',
    ],
    highlight: true,
    cta: 'Upgrade to Pro',
    crypto: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    tagline: 'For teams & scale',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Custom generation limits',
      'SSO + audit logs',
      'Dedicated support engineer',
      'On-prem deployment option',
      'SLA guarantee',
    ],
    cta: 'Go Enterprise',
  },
];

export function PricingPage() {
  const { navigate } = useRouter();
  const { user, profile, upgradeTier } = useAuth();
  const { toast } = useToast();

  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [enterprisePlan, setEnterprisePlan] = useState<Plan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' });

  const openCheckout = (plan: Plan) => {
    if (plan.id === 'free') {
      if (user) {
        navigate({ name: 'dashboard', section: 'workspace' });
      } else {
        navigate({ name: 'signup' });
      }
      return;
    }
    if (user && profile?.tier === plan.id) {
      toast(`You're already on the ${plan.name} plan`, 'info');
      return;
    }
    if (plan.crypto) {
      if (!user) {
        toast('Sign in to upgrade your account', 'info');
        navigate({ name: 'login' });
        return;
      }
      setCryptoOpen(true);
      return;
    }
    // Enterprise — simulated card checkout
    setSuccess(false);
    setCard({ number: '', name: '', exp: '', cvc: '' });
    setEnterprisePlan(plan);
  };

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const processPayment = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1600));
    const res = await upgradeTier('enterprise');
    if (res.error) {
      toast(res.error, 'error');
      setProcessing(false);
      return;
    }
    setProcessing(false);
    setSuccess(true);
    toast(`Payment successful — you're now on Enterprise!`);
  };

  const closeEnterprise = () => {
    if (processing) return;
    setEnterprisePlan(null);
    if (success) {
      setTimeout(() => navigate({ name: 'dashboard', section: 'billing' }), 100);
    }
  };

  const currentTier = profile?.tier;

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <PublicNavbar />

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ name: 'landing' })}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-cyber-muted transition-colors hover:text-cyber-text"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="blue">Pricing</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Plans that scale with{' '}
            <span className="gradient-text">your ambition</span>
          </h1>
          <p className="mt-4 text-cyber-muted">
            Start free, upgrade when you're ready. Every plan includes the AI
            workspace and security analyzer. Pro is payable in USDT (TRC20);
            Enterprise uses a simulated checkout.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.id;
            return (
              <Card
                key={plan.id}
                glow={plan.highlight}
                className={`relative flex flex-col p-7 animate-fade-in ${
                  plan.highlight
                    ? 'border-accent-blue/40 lg:-translate-y-3'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="blue">Most popular</Badge>
                  </div>
                )}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue/10 text-accent-blue">
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-xs text-cyber-muted">{plan.tagline}</p>
                  </div>
                </div>

                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-cyber-muted">/mo</span>
                </div>

                {plan.crypto && (
                  <div className="mb-4 flex items-center gap-1.5 text-xs text-accent-warning">
                    <Bitcoin className="h-3.5 w-3.5" />
                    Pay with USDT · TRC20
                  </div>
                )}

                <ul className="mb-6 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
                      <span className="text-cyber-dim">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {isCurrent ? (
                    <Button fullWidth variant="secondary" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      onClick={() => openCheckout(plan)}
                      leftIcon={
                        plan.crypto ? <Bitcoin className="h-4 w-4" /> : undefined
                      }
                    >
                      {plan.cta}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-xs text-cyber-muted">
          <button
            onClick={() => navigate({ name: 'privacy' })}
            className="transition-colors hover:text-cyber-text"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate({ name: 'terms' })}
            className="transition-colors hover:text-cyber-text"
          >
            Terms of Service
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-cyber-muted">
          <Lock className="mr-1 inline h-3 w-3" />
          Pro plan accepts USDT (TRC20) crypto payments. Enterprise checkout is
          simulated for this demo.
        </p>
      </div>

      {/* CRYPTO CHECKOUT MODAL (Pro) */}
      <CryptoCheckoutModal open={cryptoOpen} onClose={() => setCryptoOpen(false)} />

      {/* SIMULATED CHECKOUT MODAL (Enterprise) */}
      <Modal
        open={!!enterprisePlan}
        onClose={closeEnterprise}
        maxWidth="max-w-lg"
        title={
          success
            ? undefined
            : enterprisePlan && (
                <span className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-accent-blue" />
                  Upgrade to {enterprisePlan.name}
                </span>
              )
        }
        subtitle={
          success
            ? undefined
            : enterprisePlan
              ? `${enterprisePlan.name} plan · $${enterprisePlan.price}/mo · cancel anytime`
              : undefined
        }
      >
        {success ? (
          <div className="py-6 text-center animate-scale-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10 shadow-glow-green">
              <Check className="h-8 w-8 text-accent-green" />
            </div>
            <h3 className="text-xl font-bold text-cyber-text">Payment confirmed</h3>
            <p className="mt-2 text-sm text-cyber-muted">
              Your account has been upgraded to{' '}
              <span className="text-accent-green">Enterprise</span>.
            </p>
            <Button
              fullWidth
              className="mt-6"
              onClick={() => navigate({ name: 'dashboard', section: 'workspace' })}
            >
              Open Workspace
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-cyber-border bg-cyber-bg/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cyber-muted">Plan</span>
                <span className="text-sm font-medium text-cyber-text">
                  Enterprise
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-cyber-muted">Billing</span>
                <span className="text-sm font-medium text-cyber-text">
                  $49/month
                </span>
              </div>
              <div className="mt-3 border-t border-cyber-border pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-cyber-text">Total today</span>
                <span className="text-lg font-bold text-accent-blue">
                  $49.00
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm text-cyber-dim">
                  Card number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
                  <input
                    value={card.number}
                    onChange={(e) =>
                      setCard({ ...card, number: formatCard(e.target.value) })
                    }
                    placeholder="4242 4242 4242 4242"
                    className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 pl-10 pr-3 font-mono text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-cyber-dim">
                  Name on card
                </label>
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  placeholder="Ada Lovelace"
                  className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 px-3 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm text-cyber-dim">
                    Expiry
                  </label>
                  <input
                    value={card.exp}
                    onChange={(e) =>
                      setCard({ ...card, exp: formatExp(e.target.value) })
                    }
                    placeholder="12/28"
                    className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 px-3 font-mono text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-cyber-dim">CVC</label>
                  <input
                    value={card.cvc}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                      })
                    }
                    placeholder="123"
                    className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 px-3 font-mono text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                  />
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              loading={processing}
              onClick={processPayment}
              leftIcon={!processing ? <Lock className="h-4 w-4" /> : undefined}
            >
              {processing ? 'Processing payment…' : `Pay $49.00`}
            </Button>

            <p className="text-center text-xs text-cyber-muted">
              <Lock className="mr-1 inline h-3 w-3" />
              Simulated payment — no card is charged. Use any test values.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
