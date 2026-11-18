import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  closeOnBackdrop?: boolean;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  closeOnBackdrop = true,
  maxWidth = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in-fast"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        className={`relative w-full ${maxWidth} animate-scale-in rounded-2xl border border-cyber-border bg-cyber-surface shadow-card`}
      >
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-blue/60 to-transparent" />
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 border-b border-cyber-border p-5">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-cyber-text">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-cyber-muted">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-cyber-muted transition-colors hover:bg-white/5 hover:text-cyber-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
