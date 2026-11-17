import { useState, useRef } from 'react';
import { Copy, Check, Bitcoin, Wallet, Link2, ShieldCheck, Loader as Loader2, Zap, ArrowRight, Network, Coins, ScanLine } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { sanitizeText } from '@/lib/sanitize';

const USDT_WALLET = 'TVYnsnsM4352zvfYiD9MEM79rwMNdf5heR';
const AMOUNT = 19;
const CURRENCY = 'USDT';
const NETWORK = 'TRC20';

interface CryptoCheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function CryptoCheckoutModal({ open, onClose }: CryptoCheckoutModalProps) {
  const { user, upgradeTier } = useAuth();
  const { toast } = useToast();
  const { navigate } = useRouter();

  const [txId, setTxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
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
      // 1. Insert payment audit record
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
      // 2. Upgrade tier
      const res = await upgradeTier('pro');
      setVerifying(false);
      if (res.error) {
        toast(res.error, 'error');
        return;
      }
      setSuccess(true);
      toast('Pro Access Activated Successfully!');
      setTimeout(() => {
        setSuccess(false);
        setTxId('');
        onClose();
        navigate({ name: 'dashboard', section: 'workspace' });
      }, 2200);
    }, 3000);
  };

  const handleClose = () => {
    if (verifying) return;
    if (verifyTimer.current) clearTimeout(verifyTimer.current);
    setTxId('');
    setSuccess(false);
    setVerifying(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!verifying}
      maxWidth="max-w-lg"
      title={
        success ? undefined : (
          <span className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-accent-warning" />
            Crypto Payment · Pro Upgrade
          </span>
        )
      }
      subtitle={
        success ? undefined : `Send ${AMOUNT} ${CURRENCY} on the ${NETWORK} network`
      }
    >
      {success ? (
        <div className="py-8 text-center animate-scale-in">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10 shadow-glow-green">
            <Check className="h-8 w-8 text-accent-green" />
            <span className="absolute inset-0 rounded-full border border-accent-green/40 animate-pulse-ring" />
          </div>
          <h3 className="text-xl font-bold text-cyber-text">Pro Access Activated!</h3>
          <p className="mt-2 text-sm text-cyber-muted">
            Your transaction has been verified on the TRC20 blockchain.
            Redirecting to your workspace…
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-accent-green">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirecting
          </div>
        </div>
      ) : verifying ? (
        <BlockchainScanner />
      ) : (
        <div className="space-y-5">
          {/* Payment instructions */}
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
                  to the secure network wallet below. After sending, paste your
                  transaction hash to verify and activate your Pro account.
                </p>
              </div>
            </div>
          </div>

          {/* Network details */}
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

          {/* Wallet address */}
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

          {/* Transaction hash input */}
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

          {/* Verify button */}
          <Button
            fullWidth
            size="lg"
            disabled={!txId.trim() || txId.trim().length < 10}
            onClick={handleVerify}
            leftIcon={<Zap className="h-4 w-4" />}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="btn-glow"
          >
            Verify &amp; Activate Pro Account
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-cyber-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-green" />
            Secured by TRC20 blockchain verification
          </div>
        </div>
      )}
    </Modal>
  );
}

function BlockchainScanner() {
  return (
    <div className="py-10 text-center">
      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
        {/* Outer pulsing rings */}
        <span className="absolute inset-0 rounded-full border border-accent-blue/30 animate-pulse-ring" />
        <span
          className="absolute inset-0 rounded-full border border-accent-blue/20 animate-pulse-ring"
          style={{ animationDelay: '0.5s' }}
        />
        {/* Inner scanner circle */}
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-accent-blue/40 bg-accent-blue/5">
          {/* Scan line */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-blue to-transparent animate-scan-line shadow-glow" />
          {/* Sweeping highlight */}
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent-blue/10 to-transparent animate-scan-sweep" />
          <ScanLine className="h-8 w-8 text-accent-blue" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-cyber-text">
        Verifying on TRC20 Blockchain…
      </h3>
      <p className="mt-2 text-sm text-cyber-muted">
        Scanning the ledger for your transaction confirmation
      </p>

      {/* Progress steps */}
      <div className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
        <ScanStep label="Connecting to TRC20 nodes" delay={0} />
        <ScanStep label="Searching transaction hash" delay={600} />
        <ScanStep label="Verifying payment confirmation" delay={1200} />
        <ScanStep label="Activating Pro account" delay={2000} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-accent-blue">
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
