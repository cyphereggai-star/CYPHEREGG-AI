import { ArrowRight, Cpu, Terminal, ShieldCheck, Zap, Sparkles, Code2, BarChart3, GitBranch } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  {
    icon: Code2,
    title: 'AI Code Generation',
    desc: 'Describe an idea in plain English and get production-ready code across 9 languages — secure by default.',
  },
  {
    icon: ShieldCheck,
    title: 'Vulnerability Analysis',
    desc: 'Paste a snippet or describe a flow. CypherEgg returns a structured report with CWE refs and remediation.',
  },
  {
    icon: Zap,
    title: 'Instant Output',
    desc: 'Sub-second generation with a streaming-feel editor panel. No spinners, no waiting, no dead ends.',
  },
  {
    icon: GitBranch,
    title: 'Full History',
    desc: 'Every generation is saved automatically. Revisit, copy, or re-run any past prompt in one click.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    desc: 'Track generations by mode and language with a clean analytics dashboard built for engineers.',
  },
  {
    icon: Cpu,
    title: 'Secure by Design',
    desc: 'Row-level security, encrypted sessions, and least-privilege access baked into every layer.',
  },
];

const STEPS = [
  { n: '01', title: 'Describe', desc: 'Type what you need in plain language.' },
  { n: '02', title: 'Generate', desc: 'AI produces code or a security report.' },
  { n: '03', title: 'Ship', desc: 'Copy, save, and track it in history.' },
];

export function LandingPage() {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const cta = () =>
    user
      ? navigate({ name: 'dashboard', section: 'workspace' })
      : navigate({ name: 'signup' });

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent-blue/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center animate-fade-in">
              <Badge variant="blue">
                <Sparkles className="h-3 w-3" /> Next-gen AI automation platform
              </Badge>
            </div>
            <h1 className="animate-slide-up text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Unlocking the Future of
              <br />
              <span className="gradient-text glow-text">Smart Automation</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-lg text-cyber-muted animate-fade-in"
              style={{ animationDelay: '120ms' }}
            >
              CypherEgg AI is your autonomous co-pilot for writing code and
              hunting security flaws. Generate, analyze, and ship — all from one
              cyber-grade workspace.
            </p>
            <div
              className="mt-10 flex flex-col items-center justify-center gap-3 animate-fade-in sm:flex-row"
              style={{ animationDelay: '220ms' }}
            >
              <Button
                size="lg"
                onClick={cta}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="btn-glow"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate({ name: 'pricing' })}
              >
                View Pricing
              </Button>
            </div>

            <div
              className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-cyber-muted animate-fade-in"
              style={{ animationDelay: '320ms' }}
            >
              {['9 languages', 'CWE-mapped reports', 'Zero-config setup', 'RLS-secured'].map(
                (f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                    {f}
                  </span>
                )
              )}
            </div>
          </div>

          {/* hero product preview */}
          <div
            className="relative mx-auto mt-16 max-w-5xl animate-slide-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-accent-blue/20 via-transparent to-accent-green/20 blur-xl" />
            <Card glow className="relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-cyber-border bg-cyber-panel/50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-accent-danger/70" />
                <span className="h-3 w-3 rounded-full bg-accent-warning/70" />
                <span className="h-3 w-3 rounded-full bg-accent-green/70" />
                <span className="ml-3 flex items-center gap-1.5 text-xs text-cyber-muted">
                  <Terminal className="h-3.5 w-3.5" /> cypheregg · workspace
                </span>
              </div>
              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-cyber-border p-5 md:border-b-0 md:border-r">
                  <p className="mb-2 text-xs uppercase tracking-wider text-cyber-muted">
                    Prompt
                  </p>
                  <p className="font-mono text-sm text-cyber-dim">
                    <span className="text-accent-green">$</span> generate a secure
                    JWT auth module in TypeScript with refresh token rotation
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded bg-accent-blue/15 px-2 py-0.5 text-[11px] text-accent-blue">
                      generate
                    </span>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-cyber-muted">
                      typescript
                    </span>
                  </div>
                </div>
                <div className="bg-cyber-bg/60 p-5">
                  <p className="mb-2 text-xs uppercase tracking-wider text-cyber-muted">
                    Output
                  </p>
                  <pre className="overflow-hidden font-mono text-xs leading-relaxed text-accent-blue/90">
                    <span className="text-cyber-muted">{'// secure JWT auth'}</span>
                    {'\n'}
                    <span className="text-accent-green">{'export async function'}</span>
                    {' sign(userId: string) {\n'}
                    {'  const token = await jwt.sign(\n'}
                    {'    { sub: userId },\n'}
                    {'    process.env.JWT_SECRET,\n'}
                    {'    { expiresIn: "15m" }\n  );\n}\n'}
                    <span className="inline-block h-4 w-2 translate-y-0.5 bg-accent-blue animate-blink" />
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="green">Capabilities</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{' '}
              <span className="text-accent-blue">build &amp; defend</span>
            </h2>
            <p className="mt-4 text-cyber-muted">
              A complete AI workspace for code generation and security analysis —
              engineered for developers who care about speed and safety.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Card
                key={f.title}
                hover
                className="group p-6 animate-fade-in"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue/10 text-accent-blue transition-all duration-300 group-hover:border-accent-blue/50 group-hover:shadow-glow"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-cyber-text">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cyber-muted">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT STRIP / HOW IT WORKS */}
      <section id="product" className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-radial-fade opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="blue">The Workspace</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                One cockpit for{' '}
                <span className="gradient-text">generation &amp; analysis</span>
              </h2>
              <p className="mt-4 text-cyber-muted">
                Switch between generating code and analyzing vulnerabilities
                without leaving the page. Every run is persisted to your history
                and reflected in your analytics — automatically.
              </p>
              <div className="mt-8 space-y-4">
                {STEPS.map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <span className="font-mono text-2xl font-bold text-accent-blue/30">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-semibold text-cyber-text">{s.title}</p>
                      <p className="text-sm text-cyber-muted">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button onClick={cta} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Launch the Workspace
                </Button>
              </div>
            </div>

            <Card glow className="overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-cyber-border bg-cyber-panel/50 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-accent-green" />
                <span className="text-xs text-cyber-muted">
                  security-analysis · report
                </span>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed text-cyber-dim">
                <p className="text-accent-danger">[CRITICAL] CWE-94 · Untrusted code execution</p>
                <p className="mt-1 text-cyber-muted">eval() on user input → full RCE</p>
                <p className="mt-3 text-accent-warning">[HIGH] CWE-89 · SQL injection</p>
                <p className="mt-1 text-cyber-muted">String-concatenated query</p>
                <p className="mt-3 text-accent-blue">[MEDIUM] CWE-539 · Token exposure</p>
                <p className="mt-1 text-cyber-muted">Token in localStorage</p>
                <p className="mt-4 text-accent-green">✓ Remediation steps generated</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card glow className="relative overflow-hidden p-10 text-center sm:p-14">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/10 blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to{' '}
                <span className="gradient-text">cypher your ideas</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cyber-muted">
                Join the next wave of developers shipping faster and safer with
                AI. It takes 30 seconds to get started.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={cta}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate({ name: 'pricing' })}
                >
                  Compare Plans
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cyber-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-cyber-muted">
            <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            All systems operational
          </div>
          <div className="flex items-center gap-5 text-sm text-cyber-muted">
            <button
              onClick={() => navigate({ name: 'privacy' })}
              className="transition-colors hover:text-cyber-text"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate({ name: 'terms' })}
              className="transition-colors hover:text-cyber-text"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate({ name: 'investors' })}
              className="transition-colors hover:text-cyber-text"
            >
              Investor Relations
            </button>
          </div>
          <p className="text-sm text-cyber-muted">
            © {new Date().getFullYear()} CypherEgg AI · Built for the future
          </p>
        </div>
      </footer>
    </div>
  );
}
