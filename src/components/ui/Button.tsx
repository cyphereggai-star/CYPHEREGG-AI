import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

const variantMap: Record<Variant, string> = {
  primary:
    'bg-accent-blue text-cyber-bg font-semibold hover:bg-accent-blue/90 btn-glow',
  secondary:
    'bg-cyber-panel text-cyber-text border border-cyber-border hover:border-accent-blue/50 hover:text-accent-blue',
  ghost: 'text-cyber-muted hover:text-cyber-text hover:bg-white/5',
  danger:
    'bg-accent-danger/15 text-accent-danger border border-accent-danger/30 hover:bg-accent-danger/25',
  outline:
    'border border-accent-blue/40 text-accent-blue hover:bg-accent-blue/10 btn-glow',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      leftIcon,
      rightIcon,
      fullWidth,
      className = '',
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60 disabled:opacity-50 disabled:cursor-not-allowed ${sizeMap[size]} ${variantMap[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
