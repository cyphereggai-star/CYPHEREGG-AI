import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, icon, hint, className = '', id, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-cyber-dim"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`h-11 w-full rounded-lg border bg-cyber-bg/60 px-3.5 text-cyber-text placeholder:text-cyber-muted/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${icon ? 'pl-10' : ''} ${
              error
                ? 'border-accent-danger/60 focus:ring-accent-danger/30'
                : success
                  ? 'border-accent-green/60 focus:ring-accent-green/30'
                  : 'border-cyber-border focus:border-accent-blue/50 focus:ring-accent-blue/30'
            } ${className}`}
            {...rest}
          />
          {(error || success) && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="h-4 w-4 text-accent-danger" />
              ) : (
                <Check className="h-4 w-4 text-accent-green" />
              )}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-accent-danger animate-fade-in-fast">
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-cyber-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
