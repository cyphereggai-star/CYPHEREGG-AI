import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CodePanelProps {
  code: string;
  language?: string;
  loading?: boolean;
  emptyHint?: string;
}

export function CodePanel({
  code,
  language = 'text',
  loading,
  emptyHint = 'Output will appear here',
}: CodePanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast('Copied to clipboard');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Copy failed', 'error');
    }
  };

  const download = () => {
    const ext = extFor(language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cypheregg-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-cyber-border bg-cyber-bg/70">
      <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-danger/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-green/60" />
          </span>
          <span className="ml-2 font-mono text-xs text-cyber-muted">
            output.{extFor(language)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copy}
            disabled={!code || loading}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-cyber-muted transition-colors hover:bg-white/5 hover:text-cyber-text disabled:opacity-40"
            title="Copy"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-accent-green" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={download}
            disabled={!code || loading}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-cyber-muted transition-colors hover:bg-white/5 hover:text-cyber-text disabled:opacity-40"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto">
        {loading ? (
          <div className="space-y-3 p-5">
            <div className="h-3 w-3/4 rounded shimmer" />
            <div className="h-3 w-1/2 rounded shimmer" />
            <div className="h-3 w-5/6 rounded shimmer" />
            <div className="h-3 w-2/3 rounded shimmer" />
            <div className="h-3 w-4/5 rounded shimmer" />
            <div className="h-3 w-1/3 rounded shimmer" />
          </div>
        ) : code ? (
          <pre className="p-5 font-mono text-[13px] leading-relaxed text-cyber-dim whitespace-pre-wrap break-words">
            {code}
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent-blue animate-blink" />
          </pre>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyber-border bg-cyber-panel/40">
              <span className="text-2xl">{'</>'}</span>
            </div>
            <p className="text-sm text-cyber-muted">{emptyHint}</p>
            <p className="mt-1 text-xs text-cyber-muted/60">
              Enter a prompt and hit Generate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function extFor(lang: string): string {
  const map: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    go: 'go',
    rust: 'rs',
    java: 'java',
    csharp: 'cs',
    html: 'html',
    sql: 'sql',
    text: 'txt',
  };
  return map[lang] ?? 'txt';
}
