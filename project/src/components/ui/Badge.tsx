import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'blue' | 'green' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const variantMap = {
  blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  green: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning/30',
  danger: 'bg-accent-danger/10 text-accent-danger border-accent-danger/30',
  neutral: 'bg-white/5 text-cyber-muted border-cyber-border',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: 'free' | 'pro' | 'enterprise' }) {
  const map = {
    free: { variant: 'neutral' as const, label: 'Free' },
    pro: { variant: 'blue' as const, label: 'Pro' },
    enterprise: { variant: 'green' as const, label: 'Enterprise' },
  };
  const cfg = map[tier];
  return (
    <Badge variant={cfg.variant}>
      <Check className="h-3 w-3" /> {cfg.label}
    </Badge>
  );
}
