import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  glow,
  hover,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-cyber-border bg-cyber-surface/80 backdrop-blur-sm transition-all duration-300 ${hover ? 'hover:border-accent-blue/40 hover:-translate-y-1 hover:shadow-card cursor-pointer' : ''} ${glow ? 'shadow-glow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
