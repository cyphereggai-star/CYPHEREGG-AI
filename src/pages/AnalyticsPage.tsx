import { useMemo } from 'react';
import {
  Wand2,
  ShieldCheck,
  TrendingUp,
  Layers,
  Clock,
  Activity,
  Inbox,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGenerations } from '@/hooks/useGenerations';
import { useAuth } from '@/context/AuthContext';
import type { Generation, Language } from '@/lib/types';

const LANG_LABEL: Record<Language, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  csharp: 'C#',
  html: 'HTML',
  sql: 'SQL',
};

export function AnalyticsPage() {
  const { generations, loading } = useGenerations();
  const { profile } = useAuth();

  const stats = useMemo(() => computeStats(generations), [generations]);

  const cards = [
    {
      label: 'Total Generations',
      value: stats.total,
      icon: Activity,
      tint: 'text-accent-blue',
      bg: 'border-accent-blue/30 bg-accent-blue/10',
    },
    {
      label: 'Code Generated',
      value: stats.generate,
      icon: Wand2,
      tint: 'text-accent-blue',
      bg: 'border-accent-blue/30 bg-accent-blue/10',
    },
    {
      label: 'Analyses Run',
      value: stats.analyze,
      icon: ShieldCheck,
      tint: 'text-accent-green',
      bg: 'border-accent-green/30 bg-accent-green/10',
    },
    {
      label: 'This Week',
      value: stats.thisWeek,
      icon: TrendingUp,
      tint: 'text-accent-warning',
      bg: 'border-accent-warning/30 bg-accent-warning/10',
    },
  ];

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Understand how you use CypherEgg AI"
    >
      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${c.bg} ${c.tint}`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <span className="text-3xl font-bold text-cyber-text">
                {loading ? '—' : c.value}
              </span>
            </div>
            <p className="mt-3 text-sm text-cyber-muted">{c.label}</p>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <div className="h-64 rounded-xl shimmer" />
          <div className="h-48 rounded-xl shimmer" />
        </div>
      ) : stats.total === 0 ? (
        <Card className="mt-6 flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-cyber-border bg-cyber-panel/40">
            <Inbox className="h-7 w-7 text-cyber-muted" />
          </div>
          <p className="font-medium text-cyber-text">No data yet</p>
          <p className="mt-1 text-sm text-cyber-muted">
            Run your first generation in the workspace to see analytics here.
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* mode split */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-cyber-text">Mode breakdown</h3>
              <Layers className="h-4 w-4 text-cyber-muted" />
            </div>
            <SplitBar
              segments={[
                {
                  label: 'Generate',
                  value: stats.generate,
                  color: 'bg-accent-blue',
                  total: stats.total,
                },
                {
                  label: 'Analyze',
                  value: stats.analyze,
                  color: 'bg-accent-green',
                  total: stats.total,
                },
              ]}
            />
            <div className="mt-5 space-y-2">
              <Row
                icon={<Wand2 className="h-4 w-4 text-accent-blue" />}
                label="Code generation"
                value={stats.generate}
                pct={pct(stats.generate, stats.total)}
              />
              <Row
                icon={<ShieldCheck className="h-4 w-4 text-accent-green" />}
                label="Security analysis"
                value={stats.analyze}
                pct={pct(stats.analyze, stats.total)}
              />
            </div>
          </Card>

          {/* languages */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-cyber-text">
                Top languages
              </h3>
              <Badge variant="blue">{stats.langs.length}</Badge>
            </div>
            {stats.langs.length === 0 ? (
              <p className="py-8 text-center text-sm text-cyber-muted">
                No code generations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.langs.slice(0, 6).map((l) => (
                  <div key={l.lang}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-cyber-dim">
                        {LANG_LABEL[l.lang as Language] ?? l.lang}
                      </span>
                      <span className="text-cyber-muted">{l.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cyber-bg/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-blue/70 to-accent-green/60 transition-all duration-700"
                        style={{
                          width: `${pct(l.count, stats.total)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* activity timeline */}
          <Card className="p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-cyber-text">
                Recent activity
              </h3>
              <Clock className="h-4 w-4 text-cyber-muted" />
            </div>
            {stats.timeline.length === 0 ? (
              <p className="py-6 text-center text-sm text-cyber-muted">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.timeline.slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg border border-cyber-border/60 bg-cyber-bg/30 px-3 py-2.5"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        t.mode === 'analyze'
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'bg-accent-blue/10 text-accent-blue'
                      }`}
                    >
                      {t.mode === 'analyze' ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm text-cyber-dim">
                      {t.prompt}
                    </p>
                    <span className="shrink-0 text-xs text-cyber-muted">
                      {t.when}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {profile && (
        <p className="mt-6 text-center text-xs text-cyber-muted">
          Plan: <span className="text-cyber-dim capitalize">{profile.tier}</span> ·
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </p>
      )}
    </DashboardLayout>
  );
}

interface Stats {
  total: number;
  generate: number;
  analyze: number;
  thisWeek: number;
  langs: { lang: string; count: number }[];
  timeline: { id: string; mode: string; prompt: string; when: string }[];
}

function computeStats(gens: Generation[]): Stats {
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const langMap = new Map<string, number>();
  let generate = 0;
  let analyze = 0;
  let thisWeek = 0;

  for (const g of gens) {
    if (g.mode === 'generate') generate++;
    else analyze++;
    if (new Date(g.created_at).getTime() >= weekAgo) thisWeek++;
    if (g.mode === 'generate') {
      langMap.set(g.language, (langMap.get(g.language) ?? 0) + 1);
    }
  }

  return {
    total: gens.length,
    generate,
    analyze,
    thisWeek,
    langs: [...langMap.entries()]
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count),
    timeline: gens.slice(0, 8).map((g) => ({
      id: g.id,
      mode: g.mode,
      prompt: g.prompt,
      when: relativeWhen(g.created_at),
    })),
  };
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function relativeWhen(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function SplitBar({
  segments,
}: {
  segments: { label: string; value: number; color: string; total: number }[];
}) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-cyber-bg/60">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`h-full ${s.color} transition-all duration-700`}
            style={{ width: `${pct(s.value, s.total)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  pct: p,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyber-bg/40">
        {icon}
      </span>
      <span className="flex-1 text-sm text-cyber-dim">{label}</span>
      <span className="text-sm font-medium text-cyber-text">{value}</span>
      <span className="w-10 text-right text-xs text-cyber-muted">{p}%</span>
    </div>
  );
}
