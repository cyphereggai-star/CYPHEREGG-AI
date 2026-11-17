import { useState } from 'react';
import { Trash2, Wand2, ShieldCheck, Search, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CodePanel } from '@/components/CodePanel';
import { useGenerations } from '@/hooks/useGenerations';
import { useToast } from '@/components/ui/Toast';
import type { Generation } from '@/lib/types';

export function HistoryPage() {
  const { generations, loading, deleteGeneration } = useGenerations();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'generate' | 'analyze'>('all');
  const [viewing, setViewing] = useState<Generation | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Generation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = generations.filter((g) => {
    if (filter !== 'all' && g.mode !== filter) return false;
    if (query && !g.prompt.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const { error } = await deleteGeneration(confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);
    if (error) toast('Could not delete', 'error');
    else toast('Generation deleted');
  };

  return (
    <DashboardLayout
      title="History"
      subtitle="Every generation, saved automatically"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="h-10 w-full rounded-lg border border-cyber-border bg-cyber-surface/60 pl-9 pr-3 text-sm text-cyber-text placeholder:text-cyber-muted/60 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
          />
        </div>
        <div className="inline-flex rounded-lg border border-cyber-border bg-cyber-surface/60 p-1">
          {(['all', 'generate', 'analyze'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-cyber-border bg-cyber-panel/40">
            <Inbox className="h-7 w-7 text-cyber-muted" />
          </div>
          <p className="text-cyber-text font-medium">No generations yet</p>
          <p className="mt-1 text-sm text-cyber-muted">
            Run a generation in the workspace and it will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <Card
              key={g.id}
              hover
              onClick={() => setViewing(g)}
              className="p-4 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    g.mode === 'analyze'
                      ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
                      : 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue'
                  }`}
                >
                  {g.mode === 'analyze' ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={g.mode === 'analyze' ? 'green' : 'blue'}>
                      {g.mode}
                    </Badge>
                    <span className="text-xs text-cyber-muted">
                      {g.language}
                    </span>
                    <span className="text-xs text-cyber-muted">·</span>
                    <span className="text-xs text-cyber-muted">
                      {formatDate(g.created_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-cyber-dim">
                    {g.prompt}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(g);
                  }}
                  className="shrink-0 rounded-md p-2 text-cyber-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-accent-danger/10 hover:text-accent-danger"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        maxWidth="max-w-3xl"
        title={
          viewing ? (
            <span className="flex items-center gap-2">
              {viewing.mode === 'analyze' ? (
                <ShieldCheck className="h-5 w-5 text-accent-green" />
              ) : (
                <Wand2 className="h-5 w-5 text-accent-blue" />
              )}
              {viewing.mode === 'analyze' ? 'Security Report' : 'Generated Code'}
            </span>
          ) : undefined
        }
        subtitle={viewing?.prompt}
      >
        {viewing && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyber-muted">
              <Badge variant={viewing.mode === 'analyze' ? 'green' : 'blue'}>
                {viewing.mode}
              </Badge>
              <span>{viewing.language}</span>
              <span>·</span>
              <span>{formatDate(viewing.created_at)}</span>
            </div>
            <div className="h-[400px]">
              <CodePanel
                code={viewing.result}
                language={viewing.mode === 'analyze' ? 'text' : viewing.language}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete generation?"
        subtitle="This cannot be undone."
      >
        <p className="text-sm text-cyber-muted">
          Are you sure you want to permanently remove this generation from your
          history?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={doDelete}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
