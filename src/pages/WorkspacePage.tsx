import { useState } from 'react';
import { Sparkles, ShieldCheck, Wand as Wand2, Loader as Loader2, Lightbulb, Share2, Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CodePanel } from '@/components/CodePanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from '@/context/RouterContext';
import { useGenerations } from '@/hooks/useGenerations';
import { generateOutput } from '@/lib/aiEngine';
import { sanitizeText } from '@/lib/sanitize';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import type { GenerationMode, Language } from '@/lib/types';

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
  { id: 'html', label: 'HTML' },
  { id: 'sql', label: 'SQL' },
];

const EXAMPLES: Record<GenerationMode, string[]> = {
  generate: [
    'generate a secure JWT auth module with refresh token rotation',
    'build a rate limiter using a sliding window algorithm',
    'create a pagination helper for a REST API',
  ],
  analyze: [
    'analyze a login form that uses eval and string-concatenated SQL',
    'review a file upload handler accepting any file type',
    'check a CORS policy that reflects the Origin header',
  ],
};

const GUEST_LIMIT = 1;

export function WorkspacePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { navigate } = useRouter();
 const { generations, addGeneration } = useGenerations();

  const [mode, setMode] = useState<GenerationMode>('generate');
  const [language, setLanguage] = useState<Language>('typescript');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [guestRuns, setGuestRuns] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { check: rateCheck } = useRateLimiter({ max: 10, windowMs: 60_000 });

  const isFree = (profile?.tier ?? 'free') === 'free';
  const isGuest = !user;
  const guestUsedUp = isGuest && guestRuns >= GUEST_LIMIT;

  const shareOnX = () => {
    if (!output) return;
    const text = `Just ran a ${mode === 'analyze' ? 'security analysis' : 'code generation'} on CypherEgg AI — check it out:`;
    const url = 'https://cypheregg.ai';
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (['pdf', 'docx', 'xlsx', 'xls'].includes(ext)) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let extracted = '';
        for (let i = 0; i < bytes.length; i++) {
          const code = bytes[i];
          if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
            extracted += String.fromCharCode(code);
          }
        }
        const cleaned = extracted.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
        setPrompt(`File: ${file.name}\n\n${cleaned.slice(0, 14500)}`);
        toast(`Loaded ${file.name} successfully!`, 'success');
      } else {
        const text = await file.text();
        setPrompt(`File: ${file.name}\n\n${text.slice(0, 14500)}`);
        toast(`Loaded ${file.name} successfully!`, 'success');
      }
    } catch {
      toast('Could not read this file. Try another format.', 'error');
    }
    e.target.value = '';
  };

  const downloadOutput = () => {
    if (!output) return;
    const extMap: Record<string, string> = {
      python: 'py', javascript: 'js', typescript: 'ts', html: 'html',
      css: 'css', sql: 'sql', java: 'java', cpp: 'cpp', go: 'go', rust: 'rs', php: 'php'
    };
    const ext = mode === 'analyze' ? 'md' : (extMap[language] || 'txt');
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cypheregg-${mode}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded successfully!', 'success');
  };
  const run = async () => {
    if (!prompt.trim()) {
      toast('Enter a prompt first', 'error');
      return;
    }

    // Rate limit: max 10 runs per minute
    const rl = rateCheck();
    if (!rl.allowed) {
      toast(`Rate limit reached — try again in ${rl.resetIn}s`, 'error');
      return;
    }

    // Guest gate: allow 1 free analyze run, then prompt signup
    if (isGuest) {
      if (mode === 'generate' || guestUsedUp) {
        setShowSignupPrompt(true);
        return;
      }
    }
if (!isGuest && isFree && generations.length >= 3) {
  toast('Free plan limit reached (3 runs). Upgrade to Pro!', 'error');
  
  return;
}
    const cleanPrompt = sanitizeText(prompt.trim(), 2000);
navigate('/dashboard/billing');
    setRunning(true);
    setOutput('');
    const result = generateOutput({ mode, language, prompt: cleanPrompt });
    const chunks = chunkText(result, 6);
    let acc = '';
    for (const c of chunks) {
      acc += c;
      setOutput(acc);
      await delay(12);
    }
    setRunning(false);

    if (isGuest) {
      setGuestRuns((n) => n + 1);
      toast('Free analysis complete — sign up to save & run more');
      return;
    }

    const { error } = await addGeneration({
      mode,
      language,
      prompt: cleanPrompt,
      result,
      status: 'completed',
    });
    if (error) {
      toast('Could not save to history', 'error');
    } else {
      toast('Generation saved to history');
    }
  };

  const useExample = (ex: string) => setPrompt(ex);

  return (
    <DashboardLayout
      title="AI Workspace"
      subtitle="Generate code or analyze security vulnerabilities"
    >
      {/* Guest banner */}
      {isGuest && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-accent-warning/30 bg-accent-warning/5 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-accent-warning" />
          <p className="flex-1 text-sm text-cyber-dim">
            Guest mode — you get <span className="font-semibold text-accent-warning">1 free security analysis</span>. Sign up to generate code, save history, and run unlimited analyses.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate({ name: 'signup' })}>
            Create account
          </Button>
        </div>
      )}

      {/* mode toggle */}
      <div className="mb-5 inline-flex rounded-xl border border-cyber-border bg-cyber-surface/60 p-1">
        <button
          onClick={() => setMode('generate')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            mode === 'generate'
              ? 'bg-accent-blue text-cyber-bg'
              : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Wand2 className="h-4 w-4" /> Generate
        </button>
        <button
          onClick={() => setMode('analyze')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            mode === 'analyze'
              ? 'bg-accent-green text-cyber-bg'
              : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Analyze
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* INPUT */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-cyber-border bg-cyber-surface/60 p-5">
            {mode === 'generate' && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyber-muted">
                  Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                        language === l.id
                          ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                          : 'border-cyber-border text-cyber-muted hover:border-cyber-muted/40 hover:text-cyber-text'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyber-muted">
                    {mode === 'generate' ? 'Describe what to build' : 'Describe what to analyze or upload a file'}
                  </label>
                  <label className="cursor-pointer rounded-lg border border-accent-blue/40 bg-accent-blue/10 px-2.5 py-1 text-xs font-medium text-accent-blue transition hover:bg-accent-blue/20">
                    + Upload File (Code / PDF / Word / Excel)
                    <input
                      type="file"
                      accept=".py,.js,.ts,.tsx,.jsx,.html,.css,.sql,.json,.md,.txt,.csv,.java,.cpp,.c,.go,.rs,.php,.pdf,.docx,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  maxLength={15000}
              placeholder={
                mode === 'generate'
                  ? 'e.g. generate a secure rate limiter using a sliding window…'
                  : 'e.g. review a login flow that stores JWTs in localStorage and uses eval…'
              }
              className="w-full resize-none rounded-lg border border-cyber-border bg-cyber-bg/60 p-3.5 text-sm text-cyber-text placeholder:text-cyber-muted/60 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-cyber-muted">{prompt.length}/15000</span>
              {isFree && !isGuest && (
                <Badge variant="warning">
                  <Sparkles className="h-3 w-3" /> Free plan
                </Badge>
              )}
              {isGuest && mode === 'generate' && (
                <Badge variant="blue">
                  <Lock className="h-3 w-3" /> Sign up to generate
                </Badge>
              )}
              {isGuest && mode === 'analyze' && !guestUsedUp && (
                <Badge variant="green">
                  <Sparkles className="h-3 w-3" /> {GUEST_LIMIT - guestRuns} free run left
                </Badge>
              )}
            </div>

            <Button
              fullWidth
              size="lg"
              className="mt-4"
              loading={running}
              onClick={run}
              leftIcon={
                !running ? (
                  mode === 'generate' ? (
                    <Wand2 className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )
                ) : undefined
              }
            >
              {running
                ? mode === 'generate'
                  ? 'Generating…'
                  : 'Analyzing…'
                : mode === 'generate'
                  ? 'Generate Code'
                  : 'Run Analysis'}
            </Button>
          </div>

          {/* examples */}
          <div className="rounded-xl border border-cyber-border bg-cyber-surface/40 p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyber-muted">
              <Lightbulb className="h-3.5 w-3.5 text-accent-warning" /> Try an example
            </p>
            <div className="space-y-2">
              {EXAMPLES[mode].map((ex) => (
                <button
                  key={ex}
                  onClick={() => useExample(ex)}
                  className="block w-full rounded-lg border border-cyber-border bg-cyber-bg/30 px-3 py-2 text-left text-sm text-cyber-dim transition-all hover:border-accent-blue/30 hover:text-accent-blue"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyber-muted">
              {mode === 'analyze' ? 'Security Report' : 'Generated Code'}
            </p>
            <div className="flex items-center gap-3">
              {output && !running && (
      <> 
                <button
                  onClick={shareOnX}
                  className="flex items-center gap-1.5 rounded-md border border-cyber-border bg-cyber-panel/50 px-2.5 py-1 text-xs text-cyber-muted transition-all hover:border-accent-blue/40 hover:text-accent-blue"
                  title="Share on X"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share on X
                </button>
              <button
                    onClick={downloadOutput}
                    className="flex items-center gap-1.5 rounded-md border border-accent-green/40 bg-accent-green/10 px-2.5 py-1 text-xs font-medium text-accent-green transition hover:bg-accent-green/20"
                    title="Download Result"
                  >
                    Download
                  </button>)}
      </> 
              {running && (
                <span className="flex items-center gap-1.5 text-xs text-accent-blue">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> streaming
                </span>
              )}
            </div>
          </div>
          <div className="h-[520px] lg:h-[600px]">
            <CodePanel
              code={output}
              language={mode === 'analyze' ? 'text' : language}
              loading={running}
              emptyHint={
                mode === 'analyze'
                  ? 'Your security report will appear here'
                  : 'Generated code will appear here'
              }
            />
          </div>
        </div>
      </div>

      {/* Signup prompt modal for guests */}
      <Modal
        open={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        maxWidth="max-w-md"
        title={
          <span className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent-blue" />
            Create an account to continue
          </span>
        }
        subtitle="Unlock code generation, cloud history, and unlimited analyses"
      >
        <div className="space-y-4">
          <p className="text-sm text-cyber-muted">
            {mode === 'analyze'
              ? "You've used your free guest analysis. Sign up to run unlimited security analyses, generate code across 9 languages, and save everything to your cloud history."
              : 'Code generation is available for registered users. Sign up for free to generate code, run security analyses, and save your work to the cloud.'}
          </p>
          <div className="flex gap-2">
            <Button
              fullWidth
              onClick={() => {
                setShowSignupPrompt(false);
                navigate({ name: 'signup' });
              }}
            >
              Sign up free
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowSignupPrompt(false);
                navigate({ name: 'login' });
              }}
            >
              Sign in
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunkText(s: string, perChunk: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += perChunk) {
    out.push(s.slice(i, i + perChunk));
  }
  return out;
}
