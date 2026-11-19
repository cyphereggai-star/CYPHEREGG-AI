import { useState } from 'react';
import {
  CreditCard,
  Crown,
  Zap,
  Sparkles,
  Check,
  ArrowUpRight,
  User as UserIcon,
  Mail,
  Calendar,
  Loader2,
  Bitcoin,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TierBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CryptoCheckoutModal } from '@/components/CryptoCheckoutModal';
import { EnterpriseCheckoutModal } from '@/components/EnterpriseCheckoutModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Tier } from '@/lib/types';

const APP_ICON = '/iogo-cube.png.png';

const PLANS: {
  id: Tier;
  name: string;
  price: number;
  icon: typeof Zap;
  features: string[];
  crypto?: boolean;
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Sparkles,
    features: ['10 generations / mo', '3 languages', 'Basic analysis'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    icon: Zap,
    features: ['Unlimited generations', 'All 9 languages', 'Full reports', 'Priority speed'],
    crypto: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    icon: Crown,
    features: ['Everything in Pro', 'SSO + audit logs', 'Dedicated support', 'SLA'],
    crypto: true,
  },
];

export function BillingPage() {
  const { user, profile, upgradeTier, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [upgrading, setUpgrading] = useState<Tier | null>(null);
  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  const saveName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: nameValue.trim() })
      .eq('id', user.id);
    setSavingName(false);
    if (error) {
      toast('Could not update name', 'error');
      return;
    }
    await refreshProfile();
    setEditingName(false);
    toast('Profile updated');
  };

  const handlePlanAction = (tier: Tier, isCrypto: boolean) => {
    if (isCrypto) {
      if (tier === 'enterprise') {
        setEnterpriseOpen(true);
      } else {
        setCryptoOpen(true);
      }
      return;
    }
    // Free — simulated instant downgrade
    doSimUpgrade(tier);
  };

  const doSimUpgrade = async (tier: Tier) => {
    setUpgrading(tier);
    await new Promise((r) => setTimeout(r, 1400));
    const res = await upgradeTier(tier);
    setUpgrading(null);
    if (res.error) {
      toast(res.error, 'error');
      return;
    }
    if (tier === 'free') {
      toast('Switched to Free plan');
    } else {
      toast(`Upgraded to ${tier === 'enterprise' ? 'Enterprise' : 'Pro'}!`);
    }
  };

  const currentTier = profile?.tier ?? 'free';

  return (
    <DashboardLayout
      title="Billing & Account"
      subtitle="Manage your subscription and profile"
    >
      {/* current plan banner */}
      <Card glow={currentTier !== 'free'} className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                currentTier === 'enterprise'
                  ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                  : currentTier === 'pro'
                    ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                    : 'border-cyber-border bg-cyber-panel/40 text-cyber-muted'
              }`}
            >
              {currentTier === 'enterprise' ? (
                <Crown className="h-6 w-6" />
              ) : currentTier === 'pro' ? (
                <Zap className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-cyber-text capitalize">
                  {currentTier} plan
                </h3>
                <TierBadge tier={currentTier} />
              </div>
              <p className="mt-0.5 text-sm text-cyber-muted">
                {currentTier === 'free'
                  ? 'You are on the free plan. Upgrade for unlimited generations.'
                  : `Active subscription · $${currentTier === 'pro' ? '19' : '49'}/mo`}
              </p>
            </div>
          </div>
          {currentTier !== 'free' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => doSimUpgrade('free')}
              loading={upgrading === 'free'}
            >
              Downgrade to Free
            </Button>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* plans */}
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyber-muted">
            Available plans
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((p) => {
              const current = currentTier === p.id;
              return (
                <Card
                  key={p.id}
                  glow={p.id === 'pro' && !current}
                  className={`flex flex-col p-5 ${p.id === 'pro' ? 'border-accent-blue/30' : ''}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <p.icon
                      className={`h-4 w-4 ${
                        p.id === 'enterprise'
                          ? 'text-accent-green'
                          : p.id === 'pro'
                            ? 'text-accent-blue'
                            : 'text-cyber-muted'
                      }`}
                    />
                    <span className="font-semibold text-cyber-text">
                      {p.name}
                    </span>
                  </div>
                  <p className="mb-2">
                    <span className="text-2xl font-bold">${p.price}</span>
                    <span className="text-xs text-cyber-muted">/mo</span>
                  </p>
                  {p.crypto && (
                    <div className="mb-3 flex items-center gap-1 text-xs text-accent-warning">
                      <Bitcoin className="h-3 w-3" /> USDT · TRC20
                    </div>
                  )}
                  <ul className="mb-4 space-y-1.5 text-xs text-cyber-muted">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent-green" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {current ? (
                      <Button fullWidth variant="secondary" size="sm" disabled>
                        Current
                      </Button>
                    ) : p.crypto ? (
                      <Button
                        fullWidth
                        size="sm"
                        variant="primary"
                        onClick={() => handlePlanAction(p.id, true)}
                        leftIcon={<Bitcoin className="h-4 w-4" />}
                      >
                        Pay with USDT
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        size="sm"
                        variant={p.id === 'free' ? 'ghost' : 'primary'}
                        loading={upgrading === p.id}
                        onClick={() => handlePlanAction(p.id, false)}
                        leftIcon={
                          !upgrading && p.id !== 'free' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : undefined
                        }
                      >
                        {p.id === 'free' ? 'Switch to Free' : `Upgrade to ${p.name}`}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-5 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent-blue/30">
                <img src={APP_ICON} alt="CypherEgg AI" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-cyber-text">
                  Payment methods
                </p>
                <p className="mt-1 text-xs text-cyber-muted">
                  The Pro plan ($19/mo) and Enterprise plan ($49/mo) are both
                  payable in USDT on the TRC20 network. Send the exact amount to
                  the wallet address shown in the checkout modal, then paste your
                  transaction hash to verify and activate. Enterprise also offers
                  a contact-sales option for invoicing and custom SLAs. Free tier
                  changes apply instantly.{' '}
                  <button
                    onClick={() => navigate({ name: 'pricing' })}
                    className="text-accent-blue hover:underline"
                  >
                    View Pricing page
                  </button>
                  .
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* account settings */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyber-muted">
            Account
          </h3>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-green/20 text-base font-semibold text-accent-blue border border-accent-blue/30">
                {(profile?.full_name || user?.email || 'U')
                  .split(/[\s@.]+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join('') || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-cyber-text">
                  {profile?.full_name || 'User'}
                </p>
                <TierBadge tier={currentTier} />
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email ?? '—'} />

              {editingName ? (
                <div className="space-y-2">
                  <Input
                    label="Full name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" loading={savingName} onClick={saveName}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingName(false);
                        setNameValue(profile?.full_name ?? '');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <InfoRow
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Name"
                  value={profile?.full_name || 'Not set'}
                  action={
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-xs text-accent-blue hover:underline"
                    >
                      Edit
                    </button>
                  }
                />
              )}

              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Joined"
                value={
                  profile
                    ? new Date(profile.created_at).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )
                    : '—'
                }
              />
              <InfoRow
                icon={<CreditCard className="h-4 w-4" />}
                label="Plan"
                value={
                  <span className="capitalize">{currentTier}</span> as React.ReactNode
                }
              />
            </div>
          </Card>
        </div>
      </div>

      {/* CRYPTO CHECKOUT MODAL (Pro) */}
      <CryptoCheckoutModal open={cryptoOpen} onClose={() => setCryptoOpen(false)} />

      {/* ENTERPRISE CHECKOUT MODAL */}
      <EnterpriseCheckoutModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />

      {/* processing overlay (Enterprise / Free) */}
      <Modal
        open={!!upgrading}
        onClose={() => {}}
        closeOnBackdrop={false}
        maxWidth="max-w-sm"
      >
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent-blue/30 bg-accent-blue/10">
            <Loader2 className="h-7 w-7 animate-spin text-accent-blue" />
          </div>
          <h3 className="text-lg font-semibold text-cyber-text">
            Processing upgrade…
          </h3>
          <p className="mt-2 text-sm text-cyber-muted">
            Securely updating your subscription.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function InfoRow({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-cyber-border/60 bg-cyber-bg/30 px-3 py-2.5">
      <span className="text-cyber-muted">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-cyber-muted">
          {label}
        </p>
        <p className="truncate text-sm text-cyber-text">{value}</p>
      </div>
      {action}
    </div>
  );
}
