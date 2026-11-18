import { useState, useRef } from 'react';
import { Copy, Check, Bitcoin, Wallet, Link2, ShieldCheck, Loader as Loader2, Crown, ArrowRight, Network, Coins, ScanLine, Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { sanitizeText } from '@/lib/sanitize';

const USDT_WALLET = 'TVYnsnsM4352zvfYiD9MEM79rwMNdf5heR';
const AMOUNT = 49;
const CURRENCY = 'USDT';
const NETWORK = 'TRC20';
const SALES_EMAIL = 'cypheregg.ai@gmail.com';

interface EnterpriseCheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function EnterpriseCheckoutModal({ open, onClose }: EnterpriseCheckoutModalProps) {
  const { user, upgradeTier } = useAuth();
  const { toast } = useToast();
  const { navigate } = useRouter();

  const [tab, setTab] = useState<'crypto' | 'sales'>('crypto');
  const [txId, setTxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [salesForm, setSalesForm] = useState({ company: '', message: '' });
  const [sendingSales, setSendingSales] = useState(false);
  const verifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(USDT_WALLET);
      setCopied(true);
      toast('Wallet address copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Copy failed — select and copy manually', 'error');
    }
  };

  const handleVerify = async () => {
    if (!txId.trim() || txId.trim().length < 10) {
      toast('Enter a valid transaction hash', 'error');
      return;
    }
    setVerifying(true);
    verifyTimer.current = setTimeout(async () => {
      const { error: payError } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user?.id,
          user_email: user?.email ?? '',
          tx_id: sanitizeText(txId.trim(), 200),
          amount: AMOUNT,
          status: 'pending',
        });
      if (payError) {
        setVerifying(false);
        toast('Could not record payment — please try again', 'error');
        return;
      }
      const res = await upgradeTier('enterprise');
      setVerifying(false);
      if (res.error) {
        toast(res.error, 'error');
        return;
      }
      setSuccess(true);
      toast('Enterprise Access Activated Successfully!');
      setTimeout(() => {
        setSuccess(false);
        setTxId('');
        onClose();
        navigate({ name: 'dashboard', section: 'workspace' });
      }, 2200);
    }, 3000);
  };

  const handleContactSales = async () => {
    if (salesForm.company.trim().length < 2 || salesForm.message.trim().length < 10) {
      toast('Please fill in your company and a brief message', 'error');
      return;
    }
    setSendingSales(true);
    const { error } = await supabase.from('investor_leads').insert({
      name: user?.user_metadata?.full_name ?? user?.email ?? 'Enterprise Lead',
      email: user?.email ?? '',
      company: sanitizeText(salesForm.company.trim(), 200),
      message: `[Enterprise Sales] ${sanitizeText(salesForm.message.trim(), 2000)}`,
    });
    setSendingSales(false);
    if (error) {
      toast('Could not send inquiry — please try again', 'error');
      return;
    }
    toast('Sales inquiry sent — we will reach out within 1 business day');
    setSalesForm({ company: '', message: '' });
    onClose();
  };

  const handleClose = () => {
    if (verifying || sendingSales) return;
    if (verifyTimer.current) clearTimeout(verifyTimer.current);
    setTxId('');
    setSuccess(false);
    setVerifying(false);
    setTab('crypto');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!verifying && !sendingSales}
      maxWidth="max-w-lg"
      title={
        success ? undefined : (
          <span className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent-green" />
            Enterprise · {AMOUNT} {CURRENCY}/mo
          </span>
        )
      }
      subtitle={success ? undefined : `Choose how to pay — crypto or contact our sales team`}
    >
      {success ? (
        <div className="py-8 text-center animate-scale-in">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10 shadow-glow-green">
            <Check className="h-8 w-8 text-accent-green" />
            <span className="absolute inset-0 rounded-full border border-accent-green/40 animate-pulse-ring" />
          </div>
          <h3 className="text-xl font-bold text-cyber-text">Enterprise Activated!</h3>
          <p className="mt-2 text-sm text-cyber-muted">
            Your transaction has been recorded on the TRC20 blockchain.
            Redirecting to your workspace…
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-accent-green">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirecting
          </div>
        </div>
      ) : verifying ? (
        <EnterpriseScanner />
      ) : (
        <div className="space-y-5">
          {/* Tab switcher */}
          <div className="flex gap-1 rounded-lg border border-cyber-border bg-cyber-bg/40 p-1">
            <button
              onClick={() => setTab('crypto')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                tab === 'crypto'
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <Bitcoin className="h-4 w-4" /> Pay with USDT
            </button>
            <button
              onClick={() => setTab('sales')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                tab === 'sales'
                  ? 'bg-accent-green/15 text-accent-green'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <Mail className="h-4 w-4" /> Contact Sales
            </button>
          </div>

          {tab === 'crypto' ? (
            <>
              <div className="rounded-xl border border-accent-warning/30 bg-accent-warning/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-warning" />
                  <div>
                    <p className="text-sm font-medium text-cyber-text">
                      Payment Instructions
                    </p>
                    <p className="mt-1 text-sm text-cyber-muted">
                      Send exactly{' '}
                      <span className="font-bold text-accent-warning">
                        {AMOUNT} {CURRENCY}
                      </span>{' '}
                      to the wallet below. After sending, paste your transaction
                      hash to verify and activate your Enterprise account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-cyber-border bg-cyber-bg/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-cyber-muted">
                    <Coins className="h-3.5 w-3.5" /> Cryptocurrency
                  </div>
                  <p className="mt-1 text-base font-semibold text-cyber-text">
                    {CURRENCY}
                  </p>
                </div>
                <div className="rounded-lg border border-cyber-border bg-cyber-bg/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-cyber-muted">
                    <Network className="h-3.5 w-3.5" /> Network
                  </div>
                  <p className="mt-1 text-base font-semibold text-accent-blue">
                    {NETWORK}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cyber-muted">
                  <Wallet className="mr-1 inline h-3.5 w-3.5" />
                  Wallet Address
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-lg border border-accent-blue/30 bg-cyber-bg/60 p-3">
                    <code className="flex-1 break-all font-mono text-sm text-accent-blue">
                      {USDT_WALLET}
                    </code>
                    <button
                      onClick={copyWallet}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyber-border bg-cyber-panel/60 text-cyber-muted transition-all hover:border-accent-blue/40 hover:text-accent-blue"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-accent-green" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-accent-green animate-fade-in-fast">
                      <Check className="h-3 w-3" /> Copied to clipboard
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-cyber-muted">
                  Only send {CURRENCY} on the {NETWORK} network. Sending other
                  currencies or networks may result in permanent loss.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyber-dim">
                  <Link2 className="mr-1 inline h-3.5 w-3.5" />
                  Enter Transaction Hash (TxID)
                </label>
                <input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="e.g., 8b4f9a...c3e2"
                  className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 px-3.5 font-mono text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                />
                <p className="mt-1.5 text-xs text-cyber-muted">
                  Paste the transaction hash from your wallet or block explorer
                  after sending the payment.
                </p>
              </div>

              <Button
                fullWidth
                size="lg"
                disabled={!txId.trim() || txId.trim().length < 10}
                onClick={handleVerify}
                leftIcon={<Crown className="h-4 w-4" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="btn-glow"
              >
                Verify &amp; Activate Enterprise
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-cyber-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-green" />
                Secured by TRC20 blockchain verification
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-accent-green/30 bg-accent-green/5 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-green" />
                  <div>
                    <p className="text-sm font-medium text-cyber-text">
                      Talk to our sales team
                    </p>
                    <p className="mt-1 text-sm text-cyber-muted">
                      For volume pricing, SSO setup, custom SLAs, or invoicing,
                      send us a message and we will respond within 1 business
                      day. You can also email us directly at{' '}
                      <a
                        href={`mailto:${SALES_EMAIL}`}
                        className="text-accent-green hover:underline"
                      >
                        {SALES_EMAIL}
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cyber-muted">
                  Company / Organization *
                </label>
                <input
                  value={salesForm.company}
                  onChange={(e) =>
                    setSalesForm({ ...salesForm, company: e.target.value })
                  }
                  placeholder="Acme Corp"
                  maxLength={200}
                  className="h-11 w-full rounded-lg border border-cyber-border bg-cyber-bg/60 px-3.5 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cyber-muted">
                  Message *
                </label>
                <textarea
                  value={salesForm.message}
                  onChange={(e) =>
                    setSalesForm({ ...salesForm, message: e.target.value })
                  }
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell us about your team size, requirements, or any questions…"
                  className="w-full resize-none rounded-lg border border-cyber-border bg-cyber-bg/60 p-3 text-sm text-cyber-text placeholder:text-cyber-muted/60 focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30"
                />
              </div>

              <Button
                fullWidth
                size="lg"
                loading={sendingSales}
                disabled={
                  salesForm.company.trim().length < 2 ||
                  salesForm.message.trim().length < 10
                }
                onClick={handleContactSales}
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Send Sales Inquiry
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function EnterpriseScanner() {
  return (
    <div className="py-10 text-center">
      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-accent-green/30 animate-pulse-ring" />
        <span
          className="absolute inset-0 rounded-full border border-accent-green/20 animate-pulse-ring"
          style={{ animationDelay: '0.5s' }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-accent-green/40 bg-accent-green/5">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-green to-transparent animate-scan-line shadow-glow-green" />
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent-green/10 to-transparent animate-scan-sweep" />
          <ScanLine className="h-8 w-8 text-accent-green" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-cyber-text">
        Verifying on TRC20 Blockchain…
      </h3>
      <p className="mt-2 text-sm text-cyber-muted">
        Scanning the ledger for your transaction confirmation
      </p>

      <div className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
        <ScanStep label="Connecting to TRC20 nodes" delay={0} />
        <ScanStep label="Searching transaction hash" delay={600} />
        <ScanStep label="Verifying payment confirmation" delay={1200} />
        <ScanStep label="Activating Enterprise account" delay={2000} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-accent-green">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Do not close this window
      </div>
    </div>
  );
}

function ScanStep({ label, delay }: { label: string; delay: number }) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!active && !timer.current) {
    timer.current = setTimeout(() => setActive(true), delay);
  }

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          active
            ? 'border-accent-green/50 bg-accent-green/10'
            : 'border-cyber-border bg-cyber-panel/40'
        }`}
      >
        {active ? (
          <Check className="h-3 w-3 text-accent-green" />
        ) : (
          <Loader2 className="h-3 w-3 animate-spin text-cyber-muted" />
        )}
      </span>
      <span
        className={`text-sm transition-colors duration-300 ${
          active ? 'text-cyber-text' : 'text-cyber-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
