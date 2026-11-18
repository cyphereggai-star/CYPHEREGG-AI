import { detectKind, extractKeywords } from './detectors';

interface Intent {
  tag: string;
  confidence: number;
}

interface Topic {
  keywords: string[];
  weight: number;
  reply: (ctx: ChatContext) => string;
}

interface ChatContext {
  raw: string;
  lower: string;
  keywords: string[];
  kind: string;
  hasQuestion: boolean;
}

function buildContext(message: string): ChatContext {
  const lower = message.toLowerCase();
  return {
    raw: message,
    lower,
    keywords: extractKeywords(message),
    kind: detectKind(message),
    hasQuestion: /\?|how|what|why|when|where|which|can|does|is|are/.test(lower),
  };
}

function scoreTopic(ctx: ChatContext, topic: Topic): number {
  let score = 0;
  for (const kw of topic.keywords) {
    if (ctx.lower.includes(kw)) score += topic.weight;
  }
  return score;
}

const TOPICS: Topic[] = [
  {
    keywords: ['hi', 'hello', 'hey', 'yo', 'sup', 'greetings', 'good morning', 'good evening', 'good afternoon'],
    weight: 3,
    reply: (ctx) => {
      const greetings = [
        "Hi there! I'm Echo, your CypherEgg AI support assistant. I can help with pricing, the workspace, security analysis, code generation, history, analytics, billing, and your account. What's on your mind?",
        "Hello! Welcome to CypherEgg AI. I'm Echo — your built-in assistant. Ask me about the platform's features, how the code generation or vulnerability analysis works, or anything about your account.",
        "Hey! Great to see you. I'm Echo, fully offline and ready to help. I can walk you through the workspace, explain security reports, compare plans, or troubleshoot — what would you like to explore?",
      ];
      return pick(greetings);
    },
  },
  {
    keywords: ['price', 'pricing', 'plan', 'cost', 'how much', 'subscription', 'upgrade', 'downgrade', 'tier'],
    weight: 4,
    reply: (ctx) => {
      if (ctx.lower.includes('compare') || ctx.lower.includes('difference')) {
        return "Here's a quick comparison:\n\n• Free — $0/mo: 10 generations, 3 languages, basic analysis, 7-day history.\n• Pro — $19/mo: Unlimited generations, all 9 languages, full CWE-mapped reports, unlimited history + analytics, priority speed.\n• Enterprise — $49/mo: Everything in Pro, plus SSO, audit logs, dedicated support, and SLA.\n\nYou can upgrade instantly from the Pricing page or your Billing section. No real card is charged — it's a simulated checkout for this demo.";
      }
      if (ctx.lower.includes('enterprise')) {
        return "The Enterprise plan ($49/mo) includes everything in Pro plus SSO, audit logs, a dedicated support engineer, on-prem deployment options, and an SLA guarantee. It's designed for teams that need custom limits and enterprise-grade controls. You can switch to Enterprise from the Billing page or the Pricing page.";
      }
      if (ctx.lower.includes('pro')) {
        return "The Pro plan is $19/month and gives you unlimited generations across all 9 languages, full CWE-mapped security reports, unlimited history and analytics, priority generation speed, and email support. It's the most popular option for active developers. You can upgrade from the Pricing page or your Billing section — checkout is simulated, so no real card is charged.";
      }
      if (ctx.lower.includes('free')) {
        return "The Free plan costs nothing and lets you explore the full workspace with 10 generations per month, 3 languages, basic security analysis, and 7-day history retention. It's a great way to try CypherEgg AI before upgrading. You can start free by signing up — no credit card needed.";
      }
      if (ctx.lower.includes('downgrade') || ctx.lower.includes('cancel')) {
        return "You can downgrade or cancel anytime from the Billing page in your dashboard. Just click 'Switch to Free' and your plan changes instantly. Since this is a demo, no real payment is involved.";
      }
      return "We offer three plans:\n\n1. Free ($0/mo) — 10 generations, 3 languages, basic analysis.\n2. Pro ($19/mo) — Unlimited generations, all 9 languages, full security reports.\n3. Enterprise ($49/mo) — Everything in Pro + SSO, audit logs, dedicated support.\n\nVisit the Pricing page to compare side-by-side or upgrade instantly. Checkout is simulated — no real card is charged.";
    },
  },
  {
    keywords: ['workspace', 'generate', 'code generation', 'how does', 'work', 'what can i do'],
    weight: 4,
    reply: (ctx) => {
      if (ctx.lower.includes('how') && (ctx.lower.includes('work') || ctx.lower.includes('use'))) {
        return "Here's how to use the workspace:\n\n1. Open the Workspace from your dashboard.\n2. Toggle between 'Generate' (write code) and 'Analyze' (security review).\n3. In Generate mode, pick a language (9 supported: JavaScript, TypeScript, Python, Go, Rust, Java, C#, HTML, SQL).\n4. Describe what you want in plain English — e.g. 'generate a secure JWT auth module with refresh token rotation'.\n5. Click 'Generate Code' — output streams in real time.\n6. Copy or download the result. It's automatically saved to your History.\n\nThe engine runs entirely offline — no external API calls needed.";
      }
      return "The Workspace is your AI cockpit. You can generate production-ready code across 9 languages or run a full security vulnerability analysis — all from one screen. Pick a mode, choose a language, describe what you need, and hit Generate. Every run is saved to your History automatically and reflected in your Analytics.";
    },
  },
  {
    keywords: ['analyz', 'vuln', 'security', 'cwe', 'owasp', 'flaw', 'detect', 'exploit', 'xss', 'sqli', 'injection', 'report'],
    weight: 5,
    reply: (ctx) => {
      if (ctx.lower.includes('cwe') || ctx.lower.includes('owasp')) {
        return "Our security analyzer maps findings to both CWE references and OWASP Top 10 categories. It detects 25+ vulnerability classes including SQL injection (CWE-89), XSS (CWE-79), RCE via eval (CWE-94), path traversal (CWE-22), SSRF (CWE-918), command injection (CWE-78), insecure deserialization (CWE-502), CSRF (CWE-352), and many more. Each finding includes severity, impact, and concrete remediation steps with secure code examples.";
      }
      if (ctx.lower.includes('how') && ctx.lower.includes('work')) {
        return "The analyzer works by pattern-matching your prompt against 25+ security rule sets. When you describe a flow or paste a snippet, it identifies indicators of common vulnerabilities (like eval, string-concatenated SQL, localStorage tokens, etc.) and generates a structured report with:\n\n• Executive summary with severity counts and risk score\n• Detailed findings with CWE/OWASP references\n• Impact analysis and remediation steps\n• Secure code examples\n• A hardening checklist and compliance mapping\n\nIt runs fully offline — no external API required.";
      }
      return "Switch the workspace to 'Analyze' mode and describe a code flow or paste a snippet. The analyzer checks for 25+ vulnerability classes — SQL injection, XSS, RCE, SSRF, path traversal, command injection, CSRF, weak crypto, hardcoded secrets, and more. You'll get a structured report with CWE references, severity ratings, impact analysis, and step-by-step remediation with secure code examples. Everything runs offline with no API keys needed.";
    },
  },
  {
    keywords: ['language', 'python', 'javascript', 'typescript', 'rust', 'golang', 'java', 'c#', 'csharp', 'sql', 'html', 'go '],
    weight: 3,
    reply: (ctx) => {
      return "CypherEgg AI supports 9 languages for code generation: JavaScript, TypeScript, Python, Go, Rust, Java, C#, HTML, and SQL. Each language has kind-aware templates — so if you ask for an auth module, a rate limiter, or a pagination helper, the output is idiomatic to that language with proper imports, types, and security patterns built in.";
    },
  },
  {
    keywords: ['history', 'saved', 'past', 'previous', 'record', 'delete generation'],
    weight: 4,
    reply: (ctx) => {
      if (ctx.lower.includes('delete') || ctx.lower.includes('remove')) {
        return "To delete a generation from your history, go to the History page, hover over any entry, and click the trash icon. You'll see a confirmation dialog before it's permanently removed. You can also search and filter your history by mode (generate/analyze) or by prompt text.";
      }
      return "Every generation — both code and security reports — is automatically saved to your History. You can revisit, search, filter by mode, view the full output in a modal, copy, or delete any past generation. Your history is private to your account and protected by row-level security.";
    },
  },
  {
    keywords: ['analytics', 'stats', 'statistics', 'usage', 'chart', 'breakdown', 'insight'],
    weight: 4,
    reply: (ctx) => {
      return "The Analytics dashboard gives you a clear picture of your usage:\n\n• Total generations, split by mode (Generate vs Analyze)\n• Activity this week\n• Top languages with visual bar charts\n• Mode breakdown with percentage splits\n• A recent activity timeline\n\nAll metrics update in real time as you use the workspace. It's a great way to see how you're using CypherEgg AI over time.";
    },
  },
  {
    keywords: ['billing', 'account', 'invoice', 'payment', 'card', 'charge', 'profile', 'name', 'change name', 'edit'],
    weight: 4,
    reply: (ctx) => {
      if (ctx.lower.includes('name') || ctx.lower.includes('profile') || ctx.lower.includes('edit')) {
        return "You can edit your profile name from the Billing & Account page in your dashboard. Just click 'Edit' next to your name, type the new name, and hit 'Save'. Your name is shown in the sidebar and on your account page.";
      }
      if (ctx.lower.includes('invoice') || ctx.lower.includes('receipt')) {
        return "Since Enterprise billing is simulated in this demo, no real invoices or receipts are generated. Pro plan payments are made in USDT (TRC20) — your transaction hash serves as your payment proof. In a production version, you'd find downloadable invoices and payment history on the Billing page.";
      }
      if (ctx.lower.includes('crypto') || ctx.lower.includes('usdt') || ctx.lower.includes('trc') || ctx.lower.includes('bitcoin') || ctx.lower.includes('wallet')) {
        return "The Pro plan ($19/mo) is payable in USDT on the TRC20 network. When you click 'Upgrade to Pro', a crypto payment modal opens showing the wallet address, the exact amount (19 USDT), and the network (TRC20). After sending the payment from your wallet, paste your transaction hash (TxID) into the verification field and click 'Verify & Activate Pro Account'. The system scans the TRC20 blockchain to confirm your payment and activates your Pro account instantly.";
      }
      return "Your Billing & Account page shows your current plan, lets you upgrade or downgrade, and displays your profile information. The Pro plan ($19/mo) is payable in USDT on the TRC20 network — just click 'Pay with USDT' to open the crypto checkout modal. Enterprise and Free tier changes apply instantly via simulated checkout.";
    },
  },
  {
    keywords: ['auth', 'login', 'sign in', 'sign up', 'signout', 'sign out', 'password', 'register', 'account security', 'supabase'],
    weight: 4,
    reply: (ctx) => {
      if (ctx.lower.includes('password') && (ctx.lower.includes('forgot') || ctx.lower.includes('reset'))) {
        return "If you've forgotten your password, use the 'Sign in' page — in production, a password reset flow would email you a secure link. For this demo, if you can't access your account, you can create a new one with a different email. Your data is tied to your account, so make sure to use a password you'll remember.";
      }
      return "Authentication is handled securely via Supabase with email and password. Your session is encrypted and private to you — no one else can access your data thanks to row-level security at the database level. Email confirmation is disabled for this demo, so you can sign up and start using the workspace immediately. We never store passwords in plaintext — they're hashed with a modern key-derivation function.";
    },
  },
  {
    keywords: ['refund', 'money back', 'cancel subscription'],
    weight: 5,
    reply: (ctx) => {
      return "Since all billing in this demo is simulated, there's nothing to refund — no real money is ever charged. In a production deployment, refunds would be processed from your Billing page within 14 days of payment, and you'd receive a prorated refund when downgrading mid-cycle. For real Stripe-powered billing, refunds are handled through the Stripe Dashboard automatically.";
    },
  },
  {
    keywords: ['api', 'key', 'external', 'gemini', 'openai', 'gpt', 'offline', 'internet', 'connection'],
    weight: 5,
    reply: (ctx) => {
      if (ctx.lower.includes('offline') || ctx.lower.includes('internet') || ctx.lower.includes('connection')) {
        return "CypherEgg AI runs 100% offline. The code generation engine and security analyzer are built-in — they use intelligent heuristic pattern-matching and kind-aware templates to produce realistic, production-ready output. No internet connection, external API, or API key is required. Everything happens right in your browser.";
      }
      return "CypherEgg AI has zero external API dependencies. There's no Gemini, OpenAI, or any third-party AI service involved. The entire intelligence layer is a built-in offline engine that uses intent detection, keyword analysis, and language-specific code templates to generate output and detect security vulnerabilities. This means it's fast, private, and works without any API keys or network calls.";
    },
  },
  {
    keywords: ['secure', 'safe', 'privacy', 'data', 'encryption', 'rls', 'row level'],
    weight: 4,
    reply: (ctx) => {
      return "Security is built into every layer of CypherEgg AI:\n\n• Row-Level Security (RLS) on all database tables — your data is only visible to you.\n• Encrypted sessions via Supabase Auth.\n• Passwords hashed with modern KDFs (never plaintext).\n• Least-privilege database roles.\n• No external API calls — your prompts never leave your browser.\n\nThe generated code itself follows secure-by-default patterns: parameterized queries, constant-time comparisons, input validation, and modern crypto primitives.";
    },
  },
  {
    keywords: ['rate limit', 'throttle', 'sliding window', 'token bucket'],
    weight: 3,
    reply: (ctx) => {
      return "CypherEgg AI can generate rate limiters using a sliding window or token bucket algorithm. In the workspace, switch to Generate mode, pick your language, and describe the algorithm you want — e.g. 'build a sliding window rate limiter'. The output includes the limiter class, cleanup logic, and usage examples, all with thread-safe patterns for your chosen language.";
    },
  },
  {
    keywords: ['jwt', 'token', 'refresh', 'auth module', 'session management'],
    weight: 3,
    reply: (ctx) => {
      return "CypherEgg AI generates secure JWT and session management modules with refresh token rotation. In the workspace, choose Generate mode, select your language, and describe what you need — e.g. 'generate a secure JWT auth module with refresh token rotation'. The output includes token issuance, verification with timing-safe comparison, short-lived access tokens, and single-use refresh rotation — all using proper crypto primitives.";
    },
  },
  {
    keywords: ['crypto', 'hash', 'encrypt', 'decrypt', 'cipher', 'hmac', 'sha256', 'bcrypt', 'argon2'],
    weight: 3,
    reply: (ctx) => {
      return "The crypto generation templates produce secure utilities using modern primitives — SHA-256, HMAC-SHA256, scrypt/argon2 for password hashing, and AES-GCM for encryption. Just describe the crypto operation you need in Generate mode. The engine avoids weak primitives (MD5, SHA-1, ECB mode) and includes constant-time comparison functions to prevent timing attacks.";
    },
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'great', 'awesome', 'cool', 'nice', 'love it'],
    weight: 3,
    reply: (ctx) => {
      const replies = [
        "You're very welcome! I'm here 24/7 if you have more questions. Is there anything else you'd like to know about CypherEgg AI?",
        "Happy to help! Feel free to explore the workspace — try generating some code or running a security analysis. I'm always one click away if you need me.",
        "Anytime! That's what I'm here for. Don't forget to check out the Analytics page once you've run a few generations — it gives a great overview of your activity.",
      ];
      return pick(replies);
    },
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'close', 'done'],
    weight: 3,
    reply: (ctx) => {
      return "Goodbye! Feel free to come back anytime — I'll be right here in the corner. Happy coding and stay secure!";
    },
  },
  {
    keywords: ['help', 'what can you', 'what do you do', 'who are you', 'about', 'features'],
    weight: 2,
    reply: (ctx) => {
      if ((ctx.lower.includes('who') && ctx.lower.includes('you')) || ctx.lower.includes('about you')) {
        return "I'm Echo — a fully offline intelligent assistant built into CypherEgg AI. I don't rely on any external AI service. My brain is a built-in intent-detection and knowledge engine that understands your questions about the platform and responds dynamically. I can help with:\n\n• Pricing and plans\n• How the workspace and code generation work\n• Security analysis and vulnerability reports\n• History, analytics, and billing\n• Account and authentication\n• How the offline AI engine works\n\nWhat would you like to explore?";
      }
      return "I can help you with a wide range of topics:\n\n• Pricing — compare plans, costs, upgrades\n• Workspace — how to generate code or run analyses\n• Security — what the analyzer detects (25+ vulnerability classes)\n• Languages — the 9 supported languages and their templates\n• History — viewing, searching, and deleting past generations\n• Analytics — usage stats and breakdowns\n• Billing — managing your plan and profile\n• Auth — sign in, sign up, account security\n• The engine — how the offline AI works without any API keys\n\nJust ask me anything — what are you curious about?";
    },
  },
  {
    keywords: ['bug', 'error', 'broken', 'not working', 'issue', 'problem', 'fail', 'crash'],
    weight: 3,
    reply: (ctx) => {
      return "I'm sorry you're running into an issue. Here are some things to try:\n\n• Refresh the page — the app uses a hash-based router that recovers gracefully.\n• Check that you're signed in — some features require authentication.\n• Clear your browser cache if the UI seems stuck.\n• If a generation didn't save to history, it may have been interrupted — try running it again.\n\nIf the problem persists, describe what happened and I'll help narrow it down. Since this is a demo, some features are simulated (like billing), but the workspace, analyzer, history, and analytics should all work fully.";
    },
  },
  {
    keywords: ['what is', 'explain', 'tell me about', 'describe'],
    weight: 1,
    reply: (ctx) => {
      const kw = ctx.keywords[0];
      if (kw) {
        return `Great question about "${kw}"! In the context of CypherEgg AI, you can explore this by using the workspace — switch to Generate mode and describe what you need, or try Analyze mode if it's security-related. I can also explain specific features in more detail. Could you tell me a bit more about what you're trying to accomplish?`;
      }
      return "I'd be happy to explain! Could you tell me a bit more about what you'd like me to describe? I can walk you through the workspace, the security analyzer, pricing, history, analytics, billing, or how the offline AI engine works.";
    },
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chatReply(message: string): string {
  const ctx = buildContext(message);

  let best: Topic | null = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    const s = scoreTopic(ctx, topic);
    if (s > bestScore) {
      bestScore = s;
      best = topic;
    }
  }

  if (best && bestScore >= 3) {
    return best.reply(ctx);
  }

  // fallback — try a softer match or give a helpful default
  if (best && bestScore > 0) {
    return best.reply(ctx);
  }

  return `That's an interesting one! I'm Echo, your CypherEgg AI assistant. I can help with:\n\n• Pricing and plan comparisons\n• How the workspace and code generation work\n• Security analysis and vulnerability detection\n• Supported languages (9 total)\n• History, analytics, and billing\n• Account and authentication\n• How the offline AI engine works\n\nCould you rephrase your question, or pick one of these topics? I'm here to help!`;
}
