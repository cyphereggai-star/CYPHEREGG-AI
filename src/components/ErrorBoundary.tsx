import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cyber-bg px-6 text-center">
          <div className="rounded-xl border border-accent-blue/30 bg-cyber-surface/50 px-8 py-10">
            <h1 className="mb-2 text-xl font-bold text-cyber-text">
              Something went wrong
            </h1>
            <p className="mb-6 max-w-sm text-sm text-cyber-muted">
              The application hit an unexpected error. Reloading usually fixes
              it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-accent-blue/50 bg-accent-blue/10 px-5 py-2.5 text-sm font-medium text-accent-blue transition hover:bg-accent-blue/20"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
