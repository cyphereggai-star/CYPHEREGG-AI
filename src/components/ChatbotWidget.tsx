import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import { botReply } from '@/lib/aiEngine';
import { sanitizeText } from '@/lib/sanitize';
import { useRateLimiter } from '@/hooks/useRateLimiter';

const ECHO_AVATAR = '/logo-black.png.png';

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text: string;
  streaming?: boolean;
}

let mid = 0;

const SUGGESTIONS = [
  'What plans do you offer?',
  'How does the AI workspace work?',
  'Can it analyze security vulnerabilities?',
  'Does it work offline without API keys?',
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: ++mid,
      from: 'bot',
      text: "Hi! I'm Echo, your CypherEgg AI assistant. I run fully offline — no API keys needed. Ask me about pricing, the workspace, security analysis, or how the built-in AI engine works.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { check: rateCheck } = useRateLimiter({ max: 10, windowMs: 60_000 });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  const streamReply = useCallback((replyText: string) => {
    const botId = ++mid;
    const words = replyText.split(/(\s+)/);

    setMessages((prev) => [
      ...prev,
      { id: botId, from: 'bot', text: '', streaming: true },
    ]);
    setTyping(false);

    let idx = 0;
    if (streamTimer.current) clearInterval(streamTimer.current);
    streamTimer.current = setInterval(() => {
      idx++;
      const partial = words.slice(0, idx).join('');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, text: partial } : m
        )
      );
      if (idx >= words.length) {
        if (streamTimer.current) {
          clearInterval(streamTimer.current);
          streamTimer.current = null;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, streaming: false } : m
          )
        );
      }
    }, 35);
  }, []);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;

    const rl = rateCheck();
    if (!rl.allowed) {
      setMessages((prev) => [
        ...prev,
        { id: ++mid, from: 'bot', text: `You're sending messages too quickly. Please wait ${rl.resetIn}s and try again.` },
      ]);
      return;
    }

    const clean = sanitizeText(t, 500);
    setMessages((prev) => [...prev, { id: ++mid, from: 'user', text: clean }]);
    setInput('');
    setTyping(true);

    const delay = 400 + Math.min(clean.length * 10, 700);
    setTimeout(() => {
      const reply = botReply(clean);
      streamReply(reply);
    }, delay);
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open support chat"
        className={`fixed bottom-5 right-5 z-[150] flex h-14 w-14 items-center justify-center rounded-full border border-accent-blue/40 bg-cyber-surface text-accent-blue shadow-glow-strong transition-all duration-300 hover:scale-105 ${open ? 'opacity-0 pointer-events-none scale-50' : 'animate-pulse-glow'}`}
      >
        <img
          src={ECHO_AVATAR}
          alt="Open Echo support chat"
          className="h-9 w-9 rounded-lg object-cover"
        />
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent-green ring-2 ring-cyber-surface" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[150] flex h-[min(560px,78vh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-2xl border border-cyber-border bg-cyber-surface shadow-card animate-scale-in">
          {/* header */}
          <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-accent-blue/30 bg-cyber-bg shadow-glow">
                <img
                  src={ECHO_AVATAR}
                  alt="Echo AI"
                  className="h-full w-full object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-green ring-2 ring-cyber-panel" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cyber-text">Echo</p>
                <p className="text-[11px] text-accent-green">● Online · Offline AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-cyber-muted transition-colors hover:bg-white/5 hover:text-cyber-text"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-fast`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-accent-blue text-cyber-bg rounded-br-md'
                      : 'bg-cyber-panel text-cyber-dim border border-cyber-border rounded-bl-md'
                  }`}
                >
                  {m.text}
                  {m.streaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent-blue animate-blink" />
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start animate-fade-in-fast">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-cyber-panel border border-cyber-border px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-accent-blue/70 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {messages.length <= 1 && !typing && (
              <div className="space-y-2 pt-2">
                <p className="px-1 text-[11px] uppercase tracking-wider text-cyber-muted">
                  Suggested
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-cyber-border bg-cyber-bg/40 px-3 py-2 text-left text-sm text-cyber-dim transition-colors hover:border-accent-blue/40 hover:text-accent-blue"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-cyber-border bg-cyber-panel/40 px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Echo anything…"
              className="h-10 flex-1 rounded-lg border border-cyber-border bg-cyber-bg/60 px-3 text-sm text-cyber-text placeholder:text-cyber-muted/60 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-blue text-cyber-bg transition-all hover:bg-accent-blue/90 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
