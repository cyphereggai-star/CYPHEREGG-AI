export interface Intent {
  kind: string;
  keywords: string[];
}

export interface CodeSnippet {
  text: string;
  lang: Language;
}

export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'csharp'
  | 'html'
  | 'sql';

const KIND_RULES: { kind: string; words: string[] }[] = [
  { kind: 'authentication', words: ['auth', 'login', 'logout', 'session', 'password', 'signup', 'register', 'jwt', 'oauth'] },
  { kind: 'rate-limiter', words: ['rate limit', 'ratelimit', 'throttle', 'sliding window', 'token bucket', 'leaky bucket'] },
  { kind: 'api', words: ['api', 'endpoint', 'route', 'controller', 'handler', 'middleware', 'rest'] },
  { kind: 'algorithm', words: ['sort', 'search', 'algorithm', 'binary tree', 'graph', 'dfs', 'bfs', 'dynamic programming', 'merge sort', 'quicksort'] },
  { kind: 'database', words: ['database', 'query', 'table', 'sql', 'crud', 'migration', 'schema', 'orm', 'repository'] },
  { kind: 'component', words: ['component', 'ui', 'page', 'modal', 'form', 'button', 'card', 'layout', 'navbar', 'sidebar'] },
  { kind: 'security', words: ['token', 'jwt', 'hash', 'encrypt', 'decrypt', 'cipher', 'crypto', 'hmac', 'pbkdf', 'argon2', 'bcrypt'] },
  { kind: 'network', words: ['scraper', 'crawl', 'fetch', 'http', 'websocket', 'socket', 'request', 'client', 'polling'] },
  { kind: 'validation', words: ['validate', 'validation', 'schema', 'zod', 'joi', 'sanitize', 'parse'] },
  { kind: 'pagination', words: ['pagination', 'paginate', 'cursor', 'offset', 'page', 'limit'] },
  { kind: 'cache', words: ['cache', 'memoize', 'lru', 'ttl', 'redis'] },
  { kind: 'queue', words: ['queue', 'worker', 'job', 'task', 'background', 'pubsub', 'consumer'] },
  { kind: 'logger', words: ['log', 'logger', 'logging', 'telemetry', 'tracing'] },
];

export function detectKind(prompt: string): string {
  const p = prompt.toLowerCase();
  for (const rule of KIND_RULES) {
    if (rule.words.some((w) => p.includes(w))) return rule.kind;
  }
  return 'utility';
}

export function extractKeywords(prompt: string): string[] {
  const stop = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'from',
    'and', 'or', 'but', 'not', 'no', 'if', 'then', 'else', 'when', 'while',
    'this', 'that', 'these', 'those', 'it', 'its', 'as', 'so', 'than', 'too',
    'very', 'can', 'will', 'just', 'should', 'would', 'could', 'may', 'might',
    'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'our', 'their', 'generate', 'build', 'create', 'make',
    'please', 'want', 'need', 'like', 'get', 'use', 'using', 'into', 'some',
    'module', 'function', 'code', 'script', 'program', 'snippet', 'example',
  ]);
  return Array.from(
    new Set(
      prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stop.has(w))
    )
  ).slice(0, 8);
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'solution'
  );
}

export function pascal(s: string): string {
  return s
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

export function camel(s: string): string {
  const p = pascal(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

export function nowStamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
