import React, { useState } from 'react';
import { Play, Copy, Check, Sparkles, ShieldAlert, Download, Upload, Share2, Lock } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useGenerations } from '../hooks/useGenerations';
import { useToast } from '../context/ToastContext';
import { useRouter } from '../context/RouterContext';
import { generateCode, analyzeSecurity } from '../lib/aiEngine';

const LANGUAGES = ['python', 'javascript', 'typescript', 'sql', 'html', 'css', 'java', 'cpp', 'php'];

export function WorkspacePage() {
  const { user, profile } = useAuth();
  const { generations, addGeneration } = useGenerations();
  const { toast } = useToast();
  const { navigate } = useRouter();

  const [mode, setMode] = useState<'generate' | 'analyze'>('generate');
  const [language, setLanguage] = useState('python');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const isGuest = !user;
  const tier = profile?.tier || 'free';
  const isFree = tier === 'free';
  const remaining = isGuest ? 1 : isFree ? Math.max(0, 3 - generations.length) : 9999;

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

  const handleRun = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!prompt.trim()) {
      toast('Please enter a prompt or upload a file first.', 'error');
      return;
    }

    if (!isGuest && isFree && generations.length >= 3) {
      toast('Free limit reached (3/3). Upgrade to Pro for unlimited access.', 'error');
      navigate({ name: 'dashboard', section: 'billing' });
      return;
    }

    setRunning(true);
    try {
      const cleanInput = prompt.trim().slice(0, 15000);
      const result = mode === 'generate'
        ? await generateCode(cleanInput, language)
        : await analyzeSecurity(cleanInput);

      setOutput(result);

      if (!isGuest) {
        await addGeneration({
          mode,
          language: mode === 'generate' ? language : 'security',
          prompt: cleanInput,
          output: result,
        });
        toast('Completed & saved to history!', 'success');
      } else {
        toast('Guest preview completed!', 'success');
      }
    } catch (err: any) {
      toast(err?.message || 'Execution failed. Please try again.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    if (!output) return;
    const extMap: Record<string, string> = {
      python: 'py', javascript: 'js', typescript: 'ts', html: 'html',
      css: 'css', sql: 'sql', java: 'java', cpp: 'cpp', php: 'php'
    };
    const ext = mode === 'analyze' ? 'md' : (extMap[language] || 'txt');
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cypheregg-${mode}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded file successfully!', 'success');
  };

  const shareOnX = () => {
    const text = encodeURIComponent('Just built and audited code in seconds using CypherEgg AI! 🚀 https://pages.dev');
    window.open(`https://twitter.com{text}`, '_blank');
  };

  return (
    <DashboardLayout active="workspace">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cyber-text">AI Engineering Workspace</h1>
            <p className="text-sm text-cyber-muted">Generate production code or audit files for vulnerabilities in real time.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-cyber-border bg-cyber-panel p-1">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === 'generate' ? 'bg-accent-blue text-cyber-bg shadow' : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <Sparkles className="h-4 w-4" /> Code Generation
            </button>
            <button
              type="button"
              onClick={() => setMode('analyze')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === 'analyze' ? 'bg-accent-blue text-cyber-bg shadow' : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <ShieldAlert className="h-4 w-4" /> Security Analysis
            </button>
          </div>
        </div>

        {isFree && !isGuest && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Free Plan: {remaining} of 3 tasks remaining.
            </span>
            <button
              type="button"
              onClick={() => navigate({ name: 'dashboard', section: 'billing' })}
              className="font-semibold underline hover:text-amber-200"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-cyber-border bg-cyber-panel p-5">
            <div className="space-y-4">
              {mode === 'generate' && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cyber-muted">
                    Target Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-cyber-border bg-cyber-bg px-3 py-2.5 text-sm text-cyber-text focus:border-accent-blue focus:outline-none"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyber-muted">
                    {mode === 'generate' ? 'Describe what to build or upload a file' : 'Paste code or upload a file to audit'}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent-blue/40 bg-accent-blue/10 px-3 py-1.5 text-xs font-medium text-accent-blue transition hover:bg-accent-blue/20">
                    <Upload className="h-3.5 w-3.5" />
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
                  rows={10}
                  maxLength={15000}
                  placeholder={
                    mode === 'generate'
                      ? 'e.g., Build a secure JWT authentication middleware in Python...'
                      : 'Paste code here or click "+ Upload File" above to audit any file...'
                  }
                  className="w-full rounded-xl border border-cyber-border bg-cyber-bg p-3.5 font-mono text-sm text-cyber-text placeholder-cyber-muted/50 focus:border-accent-blue focus:outline-none"
                />
                <div className="mt-1.5 flex justify-between text-xs text-cyber-muted">
                  <span>Supports Code, PDF, Word, Excel & CSV</span>
                  <span>{prompt.length}/15000</span>
                </div>
              </div>
            </div>

            <button
