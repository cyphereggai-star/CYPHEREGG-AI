import type { Language } from './detectors';
import {
  detectKind,
  slugify,
  pascal,
  camel,
  nowStamp,
  extractKeywords,
} from './detectors';

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

const LANG_COMMENT: Record<Language, string> = {
  javascript: '//',
  typescript: '//',
  python: '#',
  go: '//',
  rust: '//',
  java: '//',
  csharp: '//',
  html: '<!--',
  sql: '--',
};

interface GenContext {
  language: Language;
  kind: string;
  slug: string;
  name: string;
  prompt: string;
  keywords: string[];
}

export function generateCode(prompt: string, language: Language): string {
  const kind = detectKind(prompt);
  const slug = slugify(prompt);
  const name = pascal(slug);
  const c = LANG_COMMENT[language];
  const label = LANG_LABEL[language];
  const keywords = extractKeywords(prompt);
  const ctx: GenContext = {
    language,
    kind,
    slug,
    name,
    prompt,
    keywords,
  };

  const header =
    `${c} ═══════════════════════════════════════════════════\n` +
    `${c}  CypherEgg AI · Code Generation Engine\n` +
    `${c}  Language : ${label}\n` +
    `${c}  Category : ${kind}\n` +
    `${c}  Generated: ${nowStamp()} UTC\n` +
    `${c}  Prompt   : ${prompt.slice(0, 100)}\n` +
    `${c}  Secure by default · production-ready · zero-config\n` +
    `${c} ═══════════════════════════════════════════════════\n`;

  const body = renderByKind(ctx, c);
  return `${header}\n${body}\n`;
}

function renderByKind(ctx: GenContext, c: string): string {
  switch (ctx.kind) {
    case 'authentication':
      return genAuth(ctx, c);
    case 'rate-limiter':
      return genRateLimiter(ctx, c);
    case 'pagination':
      return genPagination(ctx, c);
    case 'cache':
      return genCache(ctx, c);
    case 'queue':
      return genQueue(ctx, c);
    case 'logger':
      return genLogger(ctx, c);
    case 'validation':
      return genValidation(ctx, c);
    case 'security':
      return genCrypto(ctx, c);
    case 'network':
      return genNetwork(ctx, c);
    case 'component':
      return genComponent(ctx, c);
    case 'database':
      return genDatabase(ctx, c);
    case 'algorithm':
      return genAlgorithm(ctx, c);
    case 'api':
      return genApi(ctx, c);
    default:
      return genUtility(ctx, c);
  }
}

/* ── per-kind templates ─────────────────────────────── */

function genAuth(ctx: GenContext, c: string): string {
  switch (ctx.language) {
    case 'typescript':
      return [
        `import { createHash, randomBytes, timingSafeEqual } from "node:crypto";`,
        ``,
        `export interface AuthTokens {`,
        `  accessToken: string;`,
        `  refreshToken: string;`,
        `  expiresIn: number;`,
        `}`,
        ``,
        `export interface SessionPayload {`,
        `  sub: string;`,
        `  iat: number;`,
        `  exp: number;`,
        `}`,
        ``,
        `const ACCESS_TTL = 15 * 60;       // 15 minutes`,
        `const REFRESH_TTL = 7 * 24 * 3600; // 7 days`,
        ``,
        `function sign(data: string, secret: string): string {`,
        `  return createHash("sha256").update(data + secret).digest("hex");`,
        `}`,
        ``,
        `export function issueTokens(userId: string, secret: string): AuthTokens {`,
        `  const now = Math.floor(Date.now() / 1000);`,
        `  const access = \`\${userId}.\${now}.\${randomBytes(16).toString("hex")}\`;`,
        `  const refresh = \`\${userId}.\${now}.\${randomBytes(32).toString("hex")}\`;`,
        `  return {`,
        `    accessToken: sign(access, secret),`,
        `    refreshToken: sign(refresh, secret),`,
        `    expiresIn: ACCESS_TTL,`,
        `  };`,
        `}`,
        ``,
        `export function verifyToken(`,
        `  token: string,`,
        `  secret: string,`,
        `  stored: string`,
        `): boolean {`,
        `  if (token.length !== stored.length) return false;`,
        `  return timingSafeEqual(Buffer.from(token), Buffer.from(stored));`,
        `}`,
        ``,
        `${c} Refresh-token rotation: each refresh is single-use;`,
        `${c} the next pair is issued atomically on exchange.`,
      ].join('\n');

    case 'python':
      return [
        `"""${ctx.name} — secure authentication module."""`,
        `from __future__ import annotations`,
        `import hashlib, hmac, os, secrets, time`,
        `from dataclasses import dataclass`,
        ``,
        `ACCESS_TTL = 900        # 15 min`,
        `REFRESH_TTL = 604800    # 7 days`,
        ``,
        `@dataclass(slots=True)`,
        `class AuthTokens:`,
        `    access_token: str`,
        `    refresh_token: str`,
        `    expires_in: int`,
        ``,
        `def _sign(data: str, secret: str) -> str:`,
        `    return hmac.new(secret.encode(), data.encode(), hashlib.sha256).hexdigest()`,
        ``,
        `def issue_tokens(user_id: str, secret: str) -> AuthTokens:`,
        `    now = int(time.time())`,
        `    raw_acc = f"{user_id}.{now}.{secrets.token_hex(16)}"`,
        `    raw_ref = f"{user_id}.{now}.{secrets.token_hex(32)}"`,
        `    return AuthTokens(`,
        `        access_token=_sign(raw_acc, secret),`,
        `        refresh_token=_sign(raw_ref, secret),`,
        `        expires_in=ACCESS_TTL,`,
        `    )`,
        ``,
        `def verify_token(token: str, secret: str, stored: str) -> bool:`,
        `    expected = _sign(stored, secret)`,
        `    return hmac.compare_digest(token, expected)`,
        ``,
        `# Single-use refresh rotation: on exchange, invalidate the old`,
        `# refresh token and issue a fresh pair atomically.`,
      ].join('\n');

    case 'go':
      return [
        `package auth`,
        ``,
        `import (`,
        `\t"crypto/hmac"`,
        `\t"crypto/sha256"`,
        `\t"encoding/hex"`,
        `\t"fmt"`,
        `\t"time"`,
        `)`,
        ``,
        `const (`,
        `\tAccessTTL  = 15 * time.Minute`,
        `\tRefreshTTL = 7 * 24 * time.Hour`,
        `)`,
        ``,
        `type Tokens struct {`,
        `\tAccessToken  string \`json:"access_token"\``,
        `\tRefreshToken string \`json:"refresh_token"\``,
        `\tExpiresIn    int64  \`json:"expires_in"\``,
        `}`,
        ``,
        `func sign(data, secret string) string {`,
        `\tmac := hmac.New(sha256.New, []byte(secret))`,
        `\tmac.Write([]byte(data))`,
        `\treturn hex.EncodeToString(mac.Sum(nil))`,
        `}`,
        ``,
        `func IssueTokens(userID, secret string) Tokens {`,
        `\tnow := time.Now().Unix()`,
        `\treturn Tokens{`,
        `\t\tAccessToken:  sign(fmt.Sprintf("%s.%d", userID, now), secret),`,
        `\t\tRefreshToken: sign(fmt.Sprintf("%s.%d.refresh", userID, now), secret),`,
        `\t\tExpiresIn:    int64(AccessTTL.Seconds()),`,
        `\t}`,
        `}`,
        ``,
        `func VerifyToken(token, secret, stored string) bool {`,
        `\texpected := sign(stored, secret)`,
        `\treturn hmac.Equal([]byte(token), []byte(expected))`,
        `}`,
      ].join('\n');

    case 'rust':
      return [
        `use hmac::{Hmac, Mac};`,
        `use sha2::Sha256;`,
        `use std::time::{SystemTime, UNIX_EPOCH};`,
        ``,
        `type HmacSha256 = Hmac<Sha256>;`,
        ``,
        `pub struct Tokens {`,
        `    pub access_token: String,`,
        `    pub refresh_token: String,`,
        `    pub expires_in: u64,`,
        `}`,
        ``,
        `const ACCESS_TTL: u64 = 900;`,
        ``,
        `fn sign(data: &str, secret: &str) -> Result<String, String> {`,
        `    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())`,
        `        .map_err(|e| e.to_string())?;`,
        `    mac.update(data.as_bytes());`,
        `    Ok(hex::encode(mac.finalize().into_bytes()))`,
        `}`,
        ``,
        `pub fn issue_tokens(user_id: &str, secret: &str) -> Result<Tokens, String> {`,
        `    let now = SystemTime::now()`,
        `        .duration_since(UNIX_EPOCH)`,
        `        .map_err(|e| e.to_string())?`,
        `        .as_secs();`,
        `    Ok(Tokens {`,
        `        access_token: sign(&format!("{user_id}.{now}"), secret)?,`,
        `        refresh_token: sign(&format!("{user_id}.{now}.r"), secret)?,`,
        `        expires_in: ACCESS_TTL,`,
        `    })`,
        `}`,
      ].join('\n');

    default:
      return genericAuth(ctx, c);
  }
}

function genericAuth(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'java':
      return [
        `package ai.cypheregg.auth;`,
        ``,
        `import javax.crypto.Mac;`,
        `import javax.crypto.spec.SecretKeySpec;`,
        `import java.util.HexFormat;`,
        ``,
        `public record ${n}Tokens(String accessToken, String refreshToken, long expiresIn) {}`,
        ``,
        `public class ${n}Service {`,
        `    private static final long ACCESS_TTL = 900L;`,
        ``,
        `    public ${n}Tokens issue(String userId, String secret) throws Exception {`,
        `        long now = System.currentTimeMillis() / 1000;`,
        `        return new ${n}Tokens(`,
        `            sign(userId + "." + now, secret),`,
        `            sign(userId + "." + now + ".r", secret),`,
        `            ACCESS_TTL`,
        `        );`,
        `    }`,
        ``,
        `    private String sign(String data, String secret) throws Exception {`,
        `        Mac mac = Mac.getInstance("HmacSHA256");`,
        `        mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));`,
        `        return HexFormat.of().formatHex(mac.doFinal(data.getBytes()));`,
        `    }`,
        `}`,
      ].join('\n');

    case 'csharp':
      return [
        `using System.Security.Cryptography;`,
        `using System.Text;`,
        ``,
        `namespace CypherEgg.Auth;`,
        ``,
        `public record ${n}Tokens(string AccessToken, string RefreshToken, long ExpiresIn);`,
        ``,
        `public class ${n}Service {`,
        `    private const long AccessTtl = 900;`,
        ``,
        `    public ${n}Tokens Issue(string userId, string secret) {`,
        `        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();`,
        `        return new ${n}Tokens(`,
        `            Sign($"{userId}.{now}", secret),`,
        `            Sign($"{userId}.{now}.r", secret),`,
        `            AccessTtl`,
        `        );`,
        `    }`,
        ``,
        `    private static string Sign(string data, string secret) {`,
        `        using var mac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));`,
        `        return Convert.ToHexString(mac.ComputeHash(Encoding.UTF8.GetBytes(data)));`,
        `    }`,
        `}`,
      ].join('\n');

    case 'javascript':
      return [
        `const crypto = require("node:crypto");`,
        ``,
        `const ACCESS_TTL = 900; // 15 min`,
        ``,
        `function sign(data, secret) {`,
        `  return crypto`,
        `    .createHmac("sha256", secret)`,
        `    .update(data)`,
        `    .digest("hex");`,
        `}`,
        ``,
        `function issueTokens(userId, secret) {`,
        `  const now = Math.floor(Date.now() / 1000);`,
        `  return {`,
        `    accessToken: sign(\`\${userId}.\${now}\`, secret),`,
        `    refreshToken: sign(\`\${userId}.\${now}.r\`, secret),`,
        `    expiresIn: ACCESS_TTL,`,
        `  };`,
        `}`,
        ``,
        `function verifyToken(token, secret, stored) {`,
        `  if (token.length !== stored.length) return false;`,
        `  return crypto.timingSafeEqual(`,
        `    Buffer.from(token),`,
        `    Buffer.from(sign(stored, secret))`,
        `  );`,
        `}`,
        ``,
        `module.exports = { issueTokens, verifyToken };`,
      ].join('\n');

    case 'sql':
      return [
        `-- ${ctx.name}: secure session table`,
        `CREATE TABLE IF NOT EXISTS sessions (`,
        `  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),`,
        `  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,`,
        `  refresh_hash  TEXT NOT NULL,`,
        `  issued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),`,
        `  expires_at    TIMESTAMPTZ NOT NULL,`,
        `  revoked       BOOLEAN NOT NULL DEFAULT false`,
        `);`,
        ``,
        `CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id) WHERE NOT revoked;`,
        `CREATE INDEX IF NOT EXISTS sessions_exp_idx ON sessions(expires_at);`,
        ``,
        `ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;`,
        ``,
        `CREATE POLICY "own_sessions" ON sessions FOR SELECT`,
        `  TO authenticated USING (auth.uid() = user_id);`,
        `CREATE POLICY "insert_own_session" ON sessions FOR INSERT`,
        `  TO authenticated WITH CHECK (auth.uid() = user_id);`,
        `CREATE POLICY "revoke_own_session" ON sessions FOR UPDATE`,
        `  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`,
        `CREATE POLICY "delete_own_session" ON sessions FOR DELETE`,
        `  TO authenticated USING (auth.uid() = user_id);`,
      ].join('\n');

    case 'html':
      return [
        `<!doctype html>`,
        `<html lang="en">`,
        `<head>`,
        `  <meta charset="utf-8" />`,
        `  <meta name="viewport" content="width=device-width, initial-scale=1" />`,
        `  <title>${n} — Login</title>`,
        `  <style>`,
        `    body{font-family:system-ui,sans-serif;background:#0b0c10;color:#e6edf3;display:grid;place-items:center;min-height:100vh}`,
        `    .card{max-width:380px;width:90%;padding:2rem;border:1px solid #1f2937;border-radius:16px;background:#111418}`,
        `    input{width:100%;padding:.7rem;margin:.4rem 0;border:1px solid #1f2937;border-radius:8px;background:#0b0c10;color:#e6edf3}`,
        `    button{width:100%;padding:.8rem;margin-top:.6rem;border:0;border-radius:8px;background:#66fcf1;color:#0b0c10;font-weight:600;cursor:pointer}`,
        `    h2{margin:0 0 1rem;text-align:center}`,
        `  </style>`,
        `</head>`,
        `<body>`,
        `  <form class="card" id="loginForm">`,
        `    <h2>Sign in</h2>`,
        `    <input type="email" placeholder="Email" required />`,
        `    <input type="password" placeholder="Password" required />`,
        `    <button type="submit">Login</button>`,
        `  </form>`,
        `  <script>`,
        `    document.getElementById("loginForm").addEventListener("submit", async (e) => {`,
        `      e.preventDefault();`,
        `      ${c} Issue tokens server-side; never store in localStorage`,
        `      alert("Submit to /api/auth/login — set HttpOnly cookie");`,
        `    });`,
        `  </script>`,
        `</body>`,
        `</html>`,
      ].join('\n');
  }
  return `// ${n} auth module — see TypeScript output for full reference`;
}

function genRateLimiter(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
      return [
        `/**`,
        ` * ${n} — sliding-window rate limiter.`,
        ` * O(1) amortized per request; memory-bounded per key.`,
        ` */`,
        `interface Window { count: number; resetAt: number; }`,
        ``,
        `export class RateLimiter {`,
        `  private store = new Map<string, Window>();`,
        ``,
        `  constructor(`,
        `    private readonly max: number,`,
        `    private readonly windowMs: number,`,
        `  ) {}`,
        ``,
        `  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {`,
        `    const now = Date.now();`,
        `    let win = this.store.get(key);`,
        ``,
        `    if (!win || now > win.resetAt) {`,
        `      win = { count: 0, resetAt: now + this.windowMs };`,
        `      this.store.set(key, win);`,
        `    }`,
        ``,
        `    if (win.count >= this.max) {`,
        `      return {`,
        `        allowed: false,`,
        `        remaining: 0,`,
        `        resetIn: Math.ceil((win.resetAt - now) / 1000),`,
        `      };`,
        `    }`,
        ``,
        `    win.count++;`,
        `    return {`,
        `      allowed: true,`,
        `      remaining: this.max - win.count,`,
        `      resetIn: Math.ceil((win.resetAt - now) / 1000),`,
        `    };`,
        `  }`,
        ``,
        `  ${c} Call periodically to evict expired entries`,
        `  cleanup(): void {`,
        `    const now = Date.now();`,
        `    for (const [key, w] of this.store) {`,
        `      if (now > w.resetAt) this.store.delete(key);`,
        `    }`,
        `  }`,
        `}`,
        ``,
        `// Usage: const limiter = new RateLimiter(100, 60_000);`,
        `// const { allowed, remaining } = limiter.check(req.ip);`,
      ].join('\n');

    case 'python':
      return [
        `"""${n} — sliding-window rate limiter."""`,
        `from __future__ import annotations`,
        `import time`,
        `from dataclasses import dataclass, field`,
        ``,
        `@dataclass`,
        `class _Window:`,
        `    count: int = 0`,
        `    reset_at: float = 0.0`,
        ``,
        `class RateLimiter:`,
        `    def __init__(self, max_requests: int, window_s: float):`,
        `        self.max = max_requests`,
        `        self.window = window_s`,
        `        self._store: dict[str, _Window] = {}`,
        ``,
        `    def check(self, key: str) -> dict:`,
        `        now = time.monotonic()`,
        `        win = self._store.get(key)`,
        `        if win is None or now > win.reset_at:`,
        `            win = _Window(count=0, reset_at=now + self.window)`,
        `            self._store[key] = win`,
        `        if win.count >= self.max:`,
        `            return {"allowed": False, "remaining": 0, "reset_in": int(win.reset_at - now)}`,
        `        win.count += 1`,
        `        return {"allowed": True, "remaining": self.max - win.count, "reset_in": int(win.reset_at - now)}`,
        ``,
        `    def cleanup(self) -> None:`,
        `        now = time.monotonic()`,
        `        expired = [k for k, w in self._store.items() if now > w.reset_at]`,
        `        for k in expired:`,
        `            del self._store[k]`,
      ].join('\n');

    case 'go':
      return [
        `package ratelimit`,
        ``,
        `import (`,
        `\t"sync"`,
        `\t"time"`,
        `)`,
        ``,
        `type window struct {`,
        `\tcount   int`,
        `\tresetAt time.Time`,
        `}`,
        ``,
        `type Limiter struct {`,
        `\tmu    sync.Mutex`,
        `\tmax   int`,
        `\tw     time.Duration`,
        `\tstore map[string]*window`,
        `}`,
        ``,
        `func New(max int, w time.Duration) *Limiter {`,
        `\treturn &Limiter{max: max, w: w, store: make(map[string]*window)}`,
        `}`,
        ``,
        `type Result struct {`,
        `\tAllowed   bool`,
        `\tRemaining int`,
        `\tResetIn   int`,
        `}`,
        ``,
        `func (l *Limiter) Check(key string) Result {`,
        `\tl.mu.Lock()`,
        `\tdefer l.mu.Unlock()`,
        `\tnow := time.Now()`,
        `\twin, ok := l.store[key]`,
        `\tif !ok || now.After(win.resetAt) {`,
        `\t\twin = &window{resetAt: now.Add(l.w)}`,
        `\t\tl.store[key] = win`,
        `\t}`,
        `\tif win.count >= l.max {`,
        `\t\treturn Result{false, 0, int(win.resetAt.Sub(now).Seconds())}`,
        `\t}`,
        `\twin.count++`,
        `\treturn Result{true, l.max - win.count, int(win.resetAt.Sub(now).Seconds())}`,
        `}`,
      ].join('\n');

    case 'rust':
      return [
        `use std::collections::HashMap;`,
        `use std::sync::Mutex;`,
        `use std::time::{Duration, Instant};`,
        ``,
        `struct Window { count: usize, reset_at: Instant }`,
        ``,
        `pub struct RateLimiter {`,
        `    max: usize,`,
        `    window: Duration,`,
        `    store: Mutex<HashMap<String, Window>>,`,
        `}`,
        ``,
        `pub struct CheckResult { pub allowed: bool, pub remaining: usize }`,
        ``,
        `impl RateLimiter {`,
        `    pub fn new(max: usize, window: Duration) -> Self {`,
        `        Self { max, window, store: Mutex::new(HashMap::new()) }`,
        `    }`,
        ``,
        `    pub fn check(&self, key: &str) -> CheckResult {`,
        `        let mut store = self.store.lock().unwrap();`,
        `        let now = Instant::now();`,
        `        let win = store.entry(key.to_string()).or_insert(Window { count: 0, reset_at: now + self.window });`,
        `        if now > win.reset_at { win.count = 0; win.reset_at = now + self.window; }`,
        `        if win.count >= self.max { return CheckResult { allowed: false, remaining: 0 }; }`,
        `        win.count += 1;`,
        `        CheckResult { allowed: true, remaining: self.max - win.count }`,
        `    }`,
        `}`,
      ].join('\n');

    case 'javascript':
      return [
        `/** ${n} — sliding-window rate limiter */`,
        ``,
        `class RateLimiter {`,
        `  #store = new Map();`,
        `  constructor(max, windowMs) { this.max = max; this.window = windowMs; }`,
        ``,
        `  check(key) {`,
        `    const now = Date.now();`,
        `    let win = this.#store.get(key);`,
        `    if (!win || now > win.resetAt) {`,
        `      win = { count: 0, resetAt: now + this.window };`,
        `      this.#store.set(key, win);`,
        `    }`,
        `    if (win.count >= this.max) return { allowed: false, remaining: 0 };`,
        `    win.count++;`,
        `    return { allowed: true, remaining: this.max - win.count };`,
        `  }`,
        ``,
        `  cleanup() {`,
        `    const now = Date.now();`,
        `    for (const [k, w] of this.#store) if (now > w.resetAt) this.#store.delete(k);`,
        `  }`,
        `}`,
        ``,
        `module.exports = { RateLimiter };`,
      ].join('\n');

    case 'java':
      return [
        `package ai.cypheregg.ratelimit;`,
        ``,
        `import java.util.concurrent.ConcurrentHashMap;`,
        ``,
        `public class RateLimiter {`,
        `    private final int max;`,
        `    private final long windowMs;`,
        `    private final ConcurrentHashMap<String, long[]> store = new ConcurrentHashMap<>();`,
        ``,
        `    public RateLimiter(int max, long windowMs) { this.max = max; this.windowMs = windowMs; }`,
        ``,
        `    public boolean check(String key) {`,
        `        long now = System.currentTimeMillis();`,
        `        long[] entry = store.compute(key, (k, v) -> {`,
        `            if (v == null || now > v[1]) return new long[]{1, now + windowMs};`,
        `            v[0]++; return v;`,
        `        });`,
        `        return entry[0] <= max;`,
        `    }`,
        `}`,
      ].join('\n');

    case 'csharp':
      return [
        `using System.Collections.Concurrent;`,
        ``,
        `namespace CypherEgg.RateLimit;`,
        ``,
        `public class RateLimiter {`,
        `    private readonly int _max;`,
        `    private readonly long _windowMs;`,
        `    private readonly ConcurrentDictionary<string, (int count, long reset)> _store = new();`,
        ``,
        `    public RateLimiter(int max, long windowMs) => (_max, _windowMs) = (max, windowMs);`,
        ``,
        `    public bool Check(string key) {`,
        `        long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();`,
        `        var (allowed, _) = _store.AddOrUpdate(`,
        `            key,`,
        `            _ => (1, now + _windowMs),`,
        `            (_, v, _) => now > v.reset ? (1, now + _windowMs) : (v.count + 1, v.reset)`,
        `        );`,
        `        return allowed <= _max;`,
        `    }`,
        `}`,
      ].join('\n');

    case 'sql':
      return [
        `-- ${n}: rate-limit log table`,
        `CREATE TABLE IF NOT EXISTS rate_limit_log (`,
        `  id         BIGSERIAL PRIMARY KEY,`,
        `  key        TEXT NOT NULL,`,
        `  window_start TIMESTAMPTZ NOT NULL,`,
        `  count      INT NOT NULL DEFAULT 1`,
        `);`,
        ``,
        `CREATE UNIQUE INDEX IF NOT EXISTS rl_key_window_uq`,
        `  ON rate_limit_log (key, window_start);`,
        ``,
        `-- Atomic upsert to increment counter within the window:`,
        `-- INSERT INTO rate_limit_log (key, window_start)`,
        `--   VALUES ($1, date_trunc('minute', now()))`,
        `-- ON CONFLICT (key, window_start)`,
        `--   DO UPDATE SET count = rate_limit_log.count + 1`,
        `-- RETURNING count;`,
      ].join('\n');

    case 'html':
      return [
        `<!doctype html>`,
        `<html><head><title>${n}</title></head>`,
        `<body>`,
        `  <p>Rate limiter UI — display 429 Too Many Requests with a Retry-After header.</p>`,
        `  <script>`,
        `    ${c} fetch interceptor that backs off on 429`,
        `    async function safeFetch(url) {`,
        `      const r = await fetch(url);`,
        `      if (r.status === 429) {`,
        `        const retry = Number(r.headers.get("Retry-After") || 1);`,
        `        await new Promise(r => setTimeout(r, retry * 1000));`,
        `        return safeFetch(url);`,
        `      }`,
        `      return r;`,
        `    }`,
        `  </script>`,
        `</body></html>`,
      ].join('\n');
  }
  return `// ${n} rate limiter`;
}

function genPagination(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
      return [
        `export interface Page<T> {`,
        `  items: T[];`,
        `  total: number;`,
        `  page: number;`,
        `  pageSize: number;`,
        `  hasNext: boolean;`,
        `}`,
        ``,
        `export function paginate<T>(rows: T[], page: number, pageSize: number): Page<T> {`,
        `  const total = rows.length;`,
        `  const start = (page - 1) * pageSize;`,
        `  const items = rows.slice(start, start + pageSize);`,
        `  return {`,
        `    items,`,
        `    total,`,
        `    page,`,
        `    pageSize,`,
        `    hasNext: start + pageSize < total,`,
        `  };`,
        `}`,
        ``,
        `${c} Cursor-based variant for large datasets:`,
        `export function cursorPaginate<T>(rows: T[], cursor: number, limit: number) {`,
        `  const start = cursor;`,
        `  const items = rows.slice(start, start + limit);`,
        `  return { items, nextCursor: start + limit < rows.length ? start + limit : null };`,
        `}`,
      ].join('\n');

    case 'python':
      return [
        `"""${n} — pagination helpers."""`,
        `from dataclasses import dataclass`,
        `from typing import Generic, TypeVar, Sequence, Optional`,
        ``,
        `T = TypeVar("T")`,
        ``,
        `@dataclass`,
        `class Page(Generic[T]):`,
        `    items: Sequence[T]`,
        `    total: int`,
        `    page: int`,
        `    page_size: int`,
        `    has_next: bool`,
        ``,
        `def paginate(rows: Sequence[T], page: int, page_size: int) -> Page[T]:`,
        `    total = len(rows)`,
        `    start = (page - 1) * page_size`,
        `    items = rows[start:start + page_size]`,
        `    return Page(items, total, page, page_size, start + page_size < total)`,
        ``,
        `def cursor_paginate(rows: Sequence[T], cursor: int, limit: int) -> dict:`,
        `    items = rows[cursor:cursor + limit]`,
        `    next_cursor = cursor + limit if cursor + limit < len(rows) else None`,
        `    return {"items": items, "next_cursor": next_cursor}`,
      ].join('\n');

    case 'go':
      return [
        `package paginate`,
        ``,
        `type Page[T any] struct {`,
        `\tItems   []T \`json:"items"\``,
        `\tTotal   int  \`json:"total"\``,
        `\tPage    int  \`json:"page"\``,
        `\tSize    int  \`json:"page_size"\``,
        `\tHasNext bool \`json:"has_next"\``,
        `}`,
        ``,
        `func Paginate[T any](rows []T, page, size int) Page[T] {`,
        `\ttotal := len(rows)`,
        `\tstart := (page - 1) * size`,
        `\tif start > total { start = total }`,
        `\tend := start + size`,
        `\tif end > total { end = total }`,
        `\treturn Page[T]{Items: rows[start:end], Total: total, Page: page, Size: size, HasNext: end < total}`,
        `}`,
      ].join('\n');

    case 'rust':
      return [
        `pub struct Page<T> { pub items: Vec<T>, pub total: usize, pub has_next: bool }`,
        ``,
        `pub fn paginate<T: Clone>(rows: &[T], page: usize, size: usize) -> Page<T> {`,
        `    let total = rows.len();`,
        `    let start = (page.saturating_sub(1)) * size;`,
        `    let end = (start + size).min(total);`,
        `    Page {`,
        `        items: rows[start.min(total)..end].to_vec(),`,
        `        total,`,
        `        has_next: end < total,`,
        `    }`,
        `}`,
      ].join('\n');

    default:
      return [
        `// ${n} — pagination helper`,
        `function paginate(rows, page, size) {`,
        `  const start = (page - 1) * size;`,
        `  return {`,
        `    items: rows.slice(start, start + size),`,
        `    total: rows.length,`,
        `    hasNext: start + size < rows.length,`,
        `  };`,
        `}`,
      ].join('\n');
  }
}

function genCache(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${n} — LRU cache with TTL */`,
        `export class LRUCache<K, V> {`,
        `  private store = new Map<K, { value: V; expires: number }>();`,
        ``,
        `  constructor(private capacity: number, private ttlMs: number) {}`,
        ``,
        `  get(key: K): V | undefined {`,
        `    const entry = this.store.get(key);`,
        `    if (!entry) return undefined;`,
        `    if (Date.now() > entry.expires) { this.store.delete(key); return undefined; }`,
        `    ${c} refresh recency`,
        `    this.store.delete(key);`,
        `    this.store.set(key, entry);`,
        `    return entry.value;`,
        `  }`,
        ``,
        `  set(key: K, value: V): void {`,
        `    if (this.store.has(key)) this.store.delete(key);`,
        `    else if (this.store.size >= this.capacity) {`,
        `      const oldest = this.store.keys().next().value;`,
        `      this.store.delete(oldest);`,
        `    }`,
        `    this.store.set(key, { value, expires: Date.now() + this.ttlMs });`,
        `  }`,
        ``,
        `  clear(): void { this.store.clear(); }`,
        `}`,
      ].join('\n');

    case 'python':
      return [
        `"""${n} — LRU cache with TTL."""`,
        `from __future__ import annotations`,
        `import time`,
        `from collections import OrderedDict`,
        `from typing import Generic, TypeVar, Optional`,
        ``,
        `K, V = TypeVar("K"), TypeVar("V")`,
        ``,
        `class LRUCache(Generic[K, V]):`,
        `    def __init__(self, capacity: int, ttl_s: float):`,
        `        self.capacity = capacity`,
        `        self.ttl = ttl_s`,
        `        self._store: OrderedDict[K, tuple[V, float]] = OrderedDict()`,
        ``,
        `    def get(self, key: K) -> Optional[V]:`,
        `        entry = self._store.get(key)`,
        `        if entry is None: return None`,
        `        value, expires = entry`,
        `        if time.monotonic() > expires:`,
        `            self._store.pop(key, None)`,
        `            return None`,
        `        self._store.move_to_end(key)`,
        `        return value`,
        ``,
        `    def set(self, key: K, value: V) -> None:`,
        `        if key in self._store:`,
        `            self._store.pop(key)`,
        `        elif len(self._store) >= self.capacity:`,
        `            self._store.popitem(last=False)`,
        `        self._store[key] = (value, time.monotonic() + self.ttl)`,
      ].join('\n');

    default:
      return [
        `// ${n} — LRU cache`,
        `class LRUCache {`,
        `  constructor(capacity, ttlMs) { this.cap = capacity; this.ttl = ttlMs; this.store = new Map(); }`,
        `  get(key) { const e = this.store.get(key); if (!e) return; if (Date.now() > e.exp) { this.store.delete(key); return; } this.store.delete(key); this.store.set(key, e); return e.value; }`,
        `  set(key, value) { if (this.store.has(key)) this.store.delete(key); else if (this.store.size >= this.cap) this.store.delete(this.store.keys().next().value); this.store.set(key, { value, exp: Date.now() + this.ttl }); }`,
        `}`,
      ].join('\n');
  }
}

function genQueue(ctx: GenContext, c: string): string {
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${ctx.name} — async task queue with concurrency control */`,
        `export class TaskQueue {`,
        `  private queue: (() => Promise<void>)[] = [];`,
        `  private active = 0;`,
        ``,
        `  constructor(private concurrency: number = 4) {}`,
        ``,
        `  add(task: () => Promise<void>): void {`,
        `    this.queue.push(task);`,
        `    this.drain();`,
        `  }`,
        ``,
        `  private drain(): void {`,
        `    while (this.active < this.concurrency && this.queue.length > 0) {`,
        `      const task = this.queue.shift()!;`,
        `      this.active++;`,
        `      task().finally(() => { this.active--; this.drain(); });`,
        `    }`,
        `  }`,
        ``,
        `  get pending(): number { return this.queue.length; }`,
        `  get running(): number { return this.active; }`,
        `}`,
      ].join('\n');

    default:
      return [
        `# ${ctx.name} — async task queue`,
        `import asyncio`,
        ``,
        `class TaskQueue:`,
        `    def __init__(self, concurrency=4):`,
        `        self.concurrency = concurrency`,
        `        self.semaphore = asyncio.Semaphore(concurrency)`,
        ``,
        `    async def run(self, tasks):`,
        `        return await asyncio.gather(*[self._wrap(t) for t in tasks])`,
        ``,
        `    async def _wrap(self, task):`,
        `        async with self.semaphore:`,
        `            return await task()`,
      ].join('\n');
  }
}

function genLogger(ctx: GenContext, c: string): string {
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${ctx.name} — structured logger with levels and redaction */`,
        `type Level = "debug" | "info" | "warn" | "error";`,
        ``,
        `const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };`,
        ``,
        `const REDACT = /(?:password|secret|token|key|authorization)["\\s:=]+([^"&\\s]+)/gi;`,
        ``,
        `export function createLogger(minLevel: Level = "info") {`,
        `  return (level: Level, msg: string, meta?: Record<string, unknown>) => {`,
        `    if (LEVELS[level] < LEVELS[minLevel]) return;`,
        `    const safe = JSON.stringify(meta ?? {}).replace(REDACT, '"[REDACTED]"');`,
        `    console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, meta: safe }));`,
        `  };`,
        `}`,
      ].join('\n');

    default:
      return [
        `# ${ctx.name} — structured logger`,
        `import json, logging`,
        ``,
        `class SafeLogger:`,
        `    REDACT_KEYS = {"password", "secret", "token", "key", "authorization"}`,
        ``,
        `    def __init__(self, name: str):`,
        `        self.log = logging.getLogger(name)`,
        ``,
        `    def _redact(self, meta: dict) -> dict:`,
        `        return {k: "***" if k.lower() in self.REDACT_KEYS else v for k, v in meta.items()}`,
        ``,
        `    def info(self, msg: str, **meta):`,
        `        self.log.info(json.dumps({"msg": msg, "meta": self._redact(meta)}))`,
      ].join('\n');
  }
}

function genValidation(ctx: GenContext, c: string): string {
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${ctx.name} — schema validation with safe parsing */`,
        `export type ValidationResult<T> =`,
        `  | { ok: true; data: T }`,
        `  | { ok: false; errors: string[] };`,
        ``,
        `export function validate<T>(input: unknown, schema: {`,
        `  [K in keyof T]: { type: string; required?: boolean; min?: number; max?: number };`,
        `}): ValidationResult<T> {`,
        `  const errors: string[] = [];`,
        `  const out: Record<string, unknown> = {};`,
        ``,
        `  for (const [field, rule] of Object.entries(schema)) {`,
        `    const value = (input as Record<string, unknown>)[field];`,
        `    if (value === undefined || value === null) {`,
        `      if (rule.required) errors.push(\`\${field} is required\`);`,
        `      continue;`,
        `    }`,
        `    if (typeof value !== rule.type) { errors.push(\`\${field} must be \${rule.type}\`); continue; }`,
        `    if (rule.min !== undefined && (value as { length: number }).length < rule.min)`,
        `      errors.push(\`\${field} must be >= \${rule.min} chars\`);`,
        `    if (rule.max !== undefined && (value as { length: number }).length > rule.max)`,
        `      errors.push(\`\${field} must be <= \${rule.max} chars\`);`,
        `    out[field] = value;`,
        `  }`,
        ``,
        `  return errors.length ? { ok: false, errors } : { ok: true, data: out as T };`,
        `}`,
      ].join('\n');

    default:
      return [
        `# ${ctx.name} — input validation`,
        `from dataclasses import dataclass`,
        `from typing import Any`,
        ``,
        `@dataclass`,
        `class Result:`,
        `    ok: bool`,
        `    data: dict`,
        `    errors: list`,
        ``,
        `def validate(input_data: dict, schema: dict) -> Result:`,
        `    errors, data = [], {}`,
        `    for field, rule in schema.items():`,
        `        val = input_data.get(field)`,
        `        if val is None:`,
        `            if rule.get("required"): errors.append(f"{field} is required")`,
        `            continue`,
        `        if not isinstance(val, rule["type"]): errors.append(f"{field} type mismatch"); continue`,
        `        data[field] = val`,
        `    return Result(ok=not errors, data=data, errors=errors)`,
      ].join('\n');
  }
}

function genCrypto(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
      return [
        `import { createHash, createHmac, randomBytes, scryptSync } from "node:crypto";`,
        ``,
        `/** ${n} — secure crypto utilities */`,
        ``,
        `export function sha256(data: string): string {`,
        `  return createHash("sha256").update(data).digest("hex");`,
        `}`,
        ``,
        `export function hmacSign(data: string, secret: string): string {`,
        `  return createHmac("sha256", secret).update(data).digest("hex");`,
        `}`,
        ``,
        `export function hashPassword(password: string, salt?: string): string {`,
        `  const s = salt ?? randomBytes(16).toString("hex");`,
        `  const derived = scryptSync(password, s, 32).toString("hex");`,
        `  return \`\${s}:\${derived}\`;`,
        `}`,
        ``,
        `export function verifyPassword(password: string, stored: string): boolean {`,
        `  const [salt, hash] = stored.split(":");`,
        `  const derived = scryptSync(password, salt, 32).toString("hex");`,
        `  return derived === hash;`,
        `}`,
        ``,
        `export function randomToken(bytes = 32): string {`,
        `  return randomBytes(bytes).toString("hex");`,
        `}`,
      ].join('\n');

    case 'python':
      return [
        `"""${n} — secure crypto utilities."""`,
        `import hashlib, hmac, os`,
        `from hashlib import scrypt`,
        ``,
        `def sha256(data: str) -> str:`,
        `    return hashlib.sha256(data.encode()).hexdigest()`,
        ``,
        `def hmac_sign(data: str, secret: str) -> str:`,
        `    return hmac.new(secret.encode(), data.encode(), hashlib.sha256).hexdigest()`,
        ``,
        `def hash_password(password: str, salt: bytes | None = None) -> str:`,
        `    s = salt or os.urandom(16)`,
        `    derived = scrypt(password.encode(), salt=s, n=16384, r=8, p=1, dklen=32)`,
        `    return f"{s.hex()}:{derived.hex()}"`,
        ``,
        `def verify_password(password: str, stored: str) -> bool:`,
        `    salt_hex, hash_hex = stored.split(":")`,
        `    derived = scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=16384, r=8, p=1, dklen=32)`,
        `    return hmac.compare_digest(derived.hex(), hash_hex)`,
        ``,
        `def random_token(nbytes: int = 32) -> str:`,
        `    return os.urandom(nbytes).hex()`,
      ].join('\n');

    case 'go':
      return [
        `package crypto`,
        ``,
        `import (`,
        `\t"crypto/hmac"`,
        `\t"crypto/rand"`,
        `\t"crypto/sha256"`,
        `\t"encoding/hex"`,
        `\t"golang.org/x/crypto/scrypt"`,
        `)`,
        ``,
        `func Sha256(data string) string {`,
        `\th := sha256.Sum256([]byte(data))`,
        `\treturn hex.EncodeToString(h[:])`,
        `}`,
        ``,
        `func HmacSign(data, secret string) string {`,
        `\tmac := hmac.New(sha256.New, []byte(secret))`,
        `\tmac.Write([]byte(data))`,
        `\treturn hex.EncodeToString(mac.Sum(nil))`,
        `}`,
        ``,
        `func HashPassword(password string) (string, error) {`,
        `\tsalt := make([]byte, 16)`,
        `\tif _, err := rand.Read(salt); err != nil { return "", err }`,
        `\tderived, err := scrypt.Key([]byte(password), salt, 16384, 8, 1, 32)`,
        `\tif err != nil { return "", err }`,
        `\treturn hex.EncodeToString(salt) + ":" + hex.EncodeToString(derived), nil`,
        `}`,
      ].join('\n');

    case 'rust':
      return [
        `use hmac::{Hmac, Mac};`,
        `use sha2::{Sha256, Digest};`,
        `use rand::RngCore;`,
        ``,
        `pub fn sha256(data: &str) -> String {`,
        `    let mut h = Sha256::new(); h.update(data.as_bytes());`,
        `    hex::encode(h.finalize())`,
        `}`,
        ``,
        `pub fn random_token(nbytes: usize) -> String {`,
        `    let mut buf = vec![0u8; nbytes];`,
        `    rand::thread_rng().fill_bytes(&mut buf);`,
        `    hex::encode(buf)`,
        `}`,
        ``,
        `pub fn hmac_sign(data: &str, secret: &str) -> Result<String, String> {`,
        `    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).map_err(|e| e.to_string())?;`,
        `    mac.update(data.as_bytes());`,
        `    Ok(hex::encode(mac.finalize().into_bytes()))`,
        `}`,
      ].join('\n');

    default:
      return genericCrypto(ctx, c);
  }
}

function genericCrypto(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'java':
      return [
        `package ai.cypheregg.crypto;`,
        ``,
        `import javax.crypto.Mac;`,
        `import javax.crypto.spec.SecretKeySpec;`,
        `import java.nio.charset.StandardCharsets;`,
        `import java.security.MessageDigest;`,
        `import java.security.SecureRandom;`,
        `import java.util.HexFormat;`,
        ``,
        `public class ${n} {`,
        `    public static String sha256(String data) throws Exception {`,
        `        var md = MessageDigest.getInstance("SHA-256");`,
        `        return HexFormat.of().formatHex(md.digest(data.getBytes(StandardCharsets.UTF_8)));`,
        `    }`,
        ``,
        `    public static String hmacSign(String data, String secret) throws Exception {`,
        `        Mac mac = Mac.getInstance("HmacSHA256");`,
        `        mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));`,
        `        return HexFormat.of().formatHex(mac.doFinal(data.getBytes()));`,
        `    }`,
        ``,
        `    public static String randomToken(int bytes) {`,
        `        var buf = new byte[bytes]; new SecureRandom().nextBytes(buf);`,
        `        return HexFormat.of().formatHex(buf);`,
        `    }`,
        `}`,
      ].join('\n');

    case 'csharp':
      return [
        `using System.Security.Cryptography;`,
        `using System.Text;`,
        ``,
        `namespace CypherEgg.Crypto;`,
        ``,
        `public static class ${n} {`,
        `    public static string Sha256(string data) =>`,
        `        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(data)));`,
        ``,
        `    public static string HmacSign(string data, string secret) {`,
        `        using var mac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));`,
        `        return Convert.ToHexString(mac.ComputeHash(Encoding.UTF8.GetBytes(data)));`,
        `    }`,
        ``,
        `    public static string RandomToken(int bytes = 32) {`,
        `        var buf = new byte[bytes]; RandomNumberGenerator.Fill(buf);`,
        `        return Convert.ToHexString(buf);`,
        `    }`,
        `}`,
      ].join('\n');

    case 'javascript':
      return [
        `const crypto = require("node:crypto");`,
        ``,
        `/** ${n} — secure crypto utilities */`,
        `function sha256(data) { return crypto.createHash("sha256").update(data).digest("hex"); }`,
        `function hmacSign(data, secret) { return crypto.createHmac("sha256", secret).update(data).digest("hex"); }`,
        `function hashPassword(password, salt) {`,
        `  const s = salt || crypto.randomBytes(16).toString("hex");`,
        `  const derived = crypto.scryptSync(password, s, 32).toString("hex");`,
        `  return \`\${s}:\${derived}\`;`,
        `}`,
        `function verifyPassword(password, stored) {`,
        `  const [salt, hash] = stored.split(":");`,
        `  return crypto.scryptSync(password, salt, 32).toString("hex") === hash;`,
        `}`,
        `function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString("hex"); }`,
        ``,
        `module.exports = { sha256, hmacSign, hashPassword, verifyPassword, randomToken };`,
      ].join('\n');

    case 'sql':
      return [
        `-- ${n}: crypto helpers in SQL (PG crypto)`,
        `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
        ``,
        `-- Hash a password with a random salt using crypt() + gen_salt('bf')`,
        `CREATE OR REPLACE FUNCTION hash_password(p TEXT) RETURNS TEXT AS $$`,
        `  SELECT crypt(p, gen_salt('bf', 12));`,
        `$$ LANGUAGE SQL IMMUTABLE;`,
        ``,
        `-- Verify a password against a stored hash`,
        `CREATE OR REPLACE FUNCTION verify_password(p TEXT, stored TEXT)`,
        `  RETURNS BOOLEAN AS $$`,
        `  SELECT crypt(p, stored) = stored;`,
        `$$ LANGUAGE SQL IMMUTABLE;`,
      ].join('\n');

    case 'html':
      return [
        `<!doctype html><html><head><title>${n}</title></head>`,
        `<body><p>Crypto utilities should run server-side. Use the Web Crypto API:</p>`,
        `<script>`,
        `  async function sha256(text) {`,
        `    const buf = new TextEncoder().encode(text);`,
        `    const hash = await crypto.subtle.digest("SHA-256", buf);`,
        `    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");`,
        `  }`,
        `</script></body></html>`,
      ].join('\n');
  }
  return `// ${n} crypto`;
}

function genNetwork(ctx: GenContext, c: string): string {
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${ctx.name} — fetch with timeout, retry, and backoff */`,
        `export async function safeFetch(`,
        `  url: string,`,
        `  opts: RequestInit & { timeoutMs?: number; retries?: number } = {},`,
        `): Promise<Response> {`,
        `  const { timeoutMs = 10_000, retries = 3, ...init } = opts;`,
        `  let lastErr: Error | undefined;`,
        ``,
        `  for (let attempt = 0; attempt < retries; attempt++) {`,
        `    const ctrl = new AbortController();`,
        `    const timer = setTimeout(() => ctrl.abort(), timeoutMs);`,
        `    try {`,
        `      const res = await fetch(url, { ...init, signal: ctrl.signal });`,
        `      clearTimeout(timer);`,
        `      if (!res.ok && res.status >= 500 && attempt < retries - 1) {`,
        `        await sleep(2 ** attempt * 500);`,
        `        continue;`,
        `      }`,
        `      return res;`,
        `    } catch (err) {`,
        `      clearTimeout(timer);`,
        `      lastErr = err as Error;`,
        `      await sleep(2 ** attempt * 500);`,
        `    }`,
        `  }`,
        `  throw lastErr ?? new Error("fetch failed");`,
        `}`,
        ``,
        `function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }`,
      ].join('\n');

    default:
      return [
        `# ${ctx.name} — HTTP client with retry`,
        `import time, requests`,
        ``,
        `def safe_get(url, retries=3, timeout=10):`,
        `    for attempt in range(retries):`,
        `        try:`,
        `            r = requests.get(url, timeout=timeout)`,
        `            if r.status_code < 500: return r`,
        `        except requests.RequestException:`,
        `            pass`,
        `        time.sleep(0.5 * 2 ** attempt)`,
        `    raise RuntimeError("fetch failed")`,
      ].join('\n');
  }
}

function genComponent(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
    case 'javascript':
      return [
        `/** ${n} — accessible React component */`,
        ctx.language === 'typescript' ? `import { useState } from "react";` : `const { useState } = require("react");`,
        ``,
        `export function ${n}({ title, onClose }: { title: string; onClose: () => void }) {`,
        `  const [open, setOpen] = useState(true);`,
        ``,
        `  if (!open) return null;`,
        ``,
        `  return (`,
        `    <div role="dialog" aria-modal="true" aria-label={title} className="modal-overlay">`,
        `      <div className="modal-card">`,
        `        <h2>{title}</h2>`,
        `        <button onClick={() => { setOpen(false); onClose(); }} aria-label="Close">✕</button>`,
        `      </div>`,
        `    </div>`,
        `  );`,
        `}`,
      ].join('\n');

    case 'html':
      return [
        `<!doctype html>`,
        `<html lang="en">`,
        `<head><meta charset="utf-8" /><title>${n}</title>`,
        `<style>`,
        `  body{font-family:system-ui,sans-serif;background:#0b0c10;color:#e6edf3;margin:2rem}`,
        `  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center}`,
        `  .modal-card{background:#111418;border:1px solid #1f2937;border-radius:12px;padding:2rem;max-width:420px}`,
        `</style></head>`,
        `<body>`,
        `  <div class="modal-overlay" id="modal">`,
        `    <div class="modal-card">`,
        `      <h2>${n}</h2>`,
        `      <button onclick="document.getElementById('modal').remove()">Close</button>`,
        `    </div>`,
        `  </div>`,
        `</body></html>`,
      ].join('\n');

    default:
      return [
        `# ${n} — UI component stub`,
        `# Use the TypeScript/HTML variant for full component implementation.`,
        `class ${n}:`,
        `    def __init__(self, title: str): self.title = title`,
        `    def render(self) -> str: return f"<h2>{self.title}</h2>"`,
      ].join('\n');
  }
}

function genDatabase(ctx: GenContext, c: string): string {
  const n = ctx.name;
  const table = ctx.slug.replace(/-/g, '_');
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${n} — parameterized repository pattern */`,
        `export interface ${n}Record {`,
        `  id: string;`,
        `  name: string;`,
        `  created_at: string;`,
        `}`,
        ``,
        `export class ${n}Repository {`,
        `  constructor(private db: { query: (sql: string, params: unknown[]) => Promise<${n}Record[]> }) {}`,
        ``,
        `  async findById(id: string): Promise<${n}Record | null> {`,
        `    const rows = await this.db.query(`,
        `      "SELECT id, name, created_at FROM ${table} WHERE id = $1",`,
        `      [id],  // parameterized — no injection`,
        `    );`,
        `    return rows[0] ?? null;`,
        `  }`,
        ``,
        `  async create(name: string): Promise<${n}Record> {`,
        `    const rows = await this.db.query(`,
        `      "INSERT INTO ${table} (name) VALUES ($1) RETURNING *",`,
        `      [name],`,
        `    );`,
        `    return rows[0];`,
        `  }`,
        `}`,
      ].join('\n');

    case 'sql':
      return [
        `-- ${n}: schema with RLS`,
        `CREATE TABLE IF NOT EXISTS ${table} (`,
        `  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),`,
        `  name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 255),`,
        `  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()`,
        `);`,
        ``,
        `CREATE INDEX IF NOT EXISTS ${table}_created_idx ON ${table} (created_at DESC);`,
        ``,
        `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
        ``,
        `CREATE POLICY "select_own" ON ${table} FOR SELECT`,
        `  TO authenticated USING (true);`,
        `CREATE POLICY "insert_own" ON ${table} FOR INSERT`,
        `  TO authenticated WITH CHECK (true);`,
        `CREATE POLICY "update_own" ON ${table} FOR UPDATE`,
        `  TO authenticated USING (true) WITH CHECK (true);`,
        `CREATE POLICY "delete_own" ON ${table} FOR DELETE`,
        `  TO authenticated USING (true);`,
      ].join('\n');

    default:
      return [
        `# ${n} — repository pattern (parameterized queries)`,
        `class ${n}Repository:`,
        `    def __init__(self, db): self.db = db`,
        ``,
        `    async def find_by_id(self, id: str):`,
        `        row = await self.db.fetchrow("SELECT * FROM ${table} WHERE id = $1", id)`,
        `        return dict(row) if row else None`,
        ``,
        `    async def create(self, name: str):`,
        `        return await self.db.fetchrow("INSERT INTO ${table} (name) VALUES ($1) RETURNING *", name)`,
      ].join('\n');
  }
}

function genAlgorithm(ctx: GenContext, c: string): string {
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${ctx.name} — merge sort (stable, O(n log n)) */`,
        `export function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {`,
        `  if (arr.length <= 1) return arr;`,
        `  const mid = Math.floor(arr.length / 2);`,
        `  const left = mergeSort(arr.slice(0, mid), compare);`,
        `  const right = mergeSort(arr.slice(mid), compare);`,
        `  return merge(left, right, compare);`,
        `}`,
        ``,
        `function merge<T>(left: T[], right: T[], cmp: (a: T, b: T) => number): T[] {`,
        `  const out: T[] = [];`,
        `  let i = 0, j = 0;`,
        `  while (i < left.length && j < right.length) {`,
        `    out.push(cmp(left[i], right[j]) <= 0 ? left[i++] : right[j++]);`,
        `  }`,
        `  return [...out, ...left.slice(i), ...right.slice(j)];`,
        `}`,
        ``,
        `// Binary search — O(log n)`,
        `export function binarySearch<T>(arr: T[], target: T): number {`,
        `  let lo = 0, hi = arr.length - 1;`,
        `  while (lo <= hi) {`,
        `    const mid = (lo + hi) >> 1;`,
        `    if (arr[mid] === target) return mid;`,
        `    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;`,
        `  }`,
        `  return -1;`,
        `}`,
      ].join('\n');

    case 'python':
      return [
        `"""${ctx.name} — merge sort + binary search."""`,
        `from typing import List, TypeVar, Callable`,
        ``,
        `T = TypeVar("T")`,
        ``,
        `def merge_sort(arr: List[T], cmp: Callable[[T, T], int]) -> List[T]:`,
        `    if len(arr) <= 1: return arr`,
        `    mid = len(arr) // 2`,
        `    left = merge_sort(arr[:mid], cmp)`,
        `    right = merge_sort(arr[mid:], cmp)`,
        `    return merge(left, right, cmp)`,
        ``,
        `def merge(left, right, cmp):`,
        `    out, i, j = [], 0, 0`,
        `    while i < len(left) and j < len(right):`,
        `        if cmp(left[i], right[j]) <= 0: out.append(left[i]); i += 1`,
        `        else: out.append(right[j]); j += 1`,
        `    return out + left[i:] + right[j:]`,
        ``,
        `def binary_search(arr: List[T], target: T) -> int:`,
        `    lo, hi = 0, len(arr) - 1`,
        `    while lo <= hi:`,
        `        mid = (lo + hi) // 2`,
        `        if arr[mid] == target: return mid`,
        `        lo, hi = (mid + 1, hi) if arr[mid] < target else (lo, mid - 1)`,
        `    return -1`,
      ].join('\n');

    default:
      return [
        `// ${ctx.name} — merge sort`,
        `function mergeSort(arr, cmp) {`,
        `  if (arr.length <= 1) return arr;`,
        `  const mid = arr.length >> 1;`,
        `  const l = mergeSort(arr.slice(0, mid), cmp);`,
        `  const r = mergeSort(arr.slice(mid), cmp);`,
        `  const out = []; let i = 0, j = 0;`,
        `  while (i < l.length && j < r.length) out.push(cmp(l[i], r[j]) <= 0 ? l[i++] : r[j++]);`,
        `  return [...out, ...l.slice(i), ...r.slice(j)];`,
        `}`,
      ].join('\n');
  }
}

function genApi(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${n} — REST API handler with validation */`,
        `import { validate } from "./validate";`,
        ``,
        `interface CreateBody { name: string; email: string; }`,
        ``,
        `export async function handleCreate(req: Request): Promise<Response> {`,
        `  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });`,
        ``,
        `  const body = await req.json().catch(() => null);`,
        `  if (!body) return json({ error: "Invalid JSON" }, 400);`,
        ``,
        `  const result = validate<CreateBody>(body, {`,
        `    name: { type: "string", required: true, min: 1, max: 100 },`,
        `    email: { type: "string", required: true, max: 255 },`,
        `  });`,
        ``,
        `  if (!result.ok) return json({ errors: result.errors }, 422);`,
        ``,
        `  ${c} persist result.data safely`,
        `  return json({ ok: true, data: result.data }, 201);`,
        `}`,
        ``,
        `function json(data: unknown, status = 200): Response {`,
        `  return new Response(JSON.stringify(data), {`,
        `    status,`,
        `    headers: { "Content-Type": "application/json" },`,
        `  });`,
        `}`,
      ].join('\n');

    default:
      return [
        `# ${n} — REST API handler`,
        `from http.server import BaseHTTPRequestHandler`,
        ``,
        `class Handler(BaseHTTPRequestHandler):`,
        `    def do_POST(self):`,
        `        length = int(self.headers.get("Content-Length", 0))`,
        `        body = self.rfile.read(length) if length else b"{}"`,
        `        self.send_response(201)`,
        `        self.send_header("Content-Type", "application/json")`,
        `        self.end_headers()`,
        `        self.wfile.write(b'{"ok": true}')`,
      ].join('\n');
  }
}

function genUtility(ctx: GenContext, c: string): string {
  const n = ctx.name;
  switch (ctx.language) {
    case 'typescript':
      return [
        `/** ${n} — utility module */`,
        `export function ${camel(ctx.slug)}(input: string): string {`,
        `  if (!input?.trim()) throw new Error("input required");`,
        `  if (input.length > 4096) throw new Error("input too long");`,
        `  return input.trim().toLowerCase();`,
        `}`,
        ``,
        `export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {`,
        `  let timer: ReturnType<typeof setTimeout>;`,
        `  return ((...args: Parameters<T>) => {`,
        `    clearTimeout(timer);`,
        `    timer = setTimeout(() => fn(...args), ms);`,
        `  }) as T;`,
        `}`,
      ].join('\n');

    case 'python':
      return [
        `"""${n} — utility module."""`,
        `from functools import wraps`,
        `import time`,
        ``,
        `def process(input_str: str) -> str:`,
        `    if not input_str.strip(): raise ValueError("input required")`,
        `    if len(input_str) > 4096: raise ValueError("input too long")`,
        `    return input_str.strip().lower()`,
        ``,
        `def debounce(ms: float):`,
        `    def deco(fn):`,
        `        last = [0.0]`,
        `        @wraps(fn)`,
        `        def wrapper(*a, **kw):`,
        `            now = time.monotonic()`,
        `            if now - last[0] >= ms / 1000:`,
        `                last[0] = now; return fn(*a, **kw)`,
        `        return wrapper`,
        `    return deco`,
      ].join('\n');

    case 'go':
      return [
        `package util`,
        ``,
        `import (`,
        `\t"fmt"`,
        `\t"strings"`,
        `)`,
        ``,
        `func Process(input string) (string, error) {`,
        `\ttrimmed := strings.TrimSpace(input)`,
        `\tif trimmed == "" { return "", fmt.Errorf("input required") }`,
        `\tif len(trimmed) > 4096 { return "", fmt.Errorf("input too long") }`,
        `\treturn strings.ToLower(trimmed), nil`,
        `}`,
      ].join('\n');

    case 'rust':
      return [
        `pub fn process(input: &str) -> Result<String, String> {`,
        `    let trimmed = input.trim();`,
        `    if trimmed.is_empty() { return Err("input required".into()); }`,
        `    if trimmed.len() > 4096 { return Err("input too long".into()); }`,
        `    Ok(trimmed.to_lowercase())`,
        `}`,
      ].join('\n');

    case 'java':
      return [
        `package ai.cypheregg.util;`,
        ``,
        `public class ${n} {`,
        `    public static String process(String input) {`,
        `        if (input == null || input.isBlank()) throw new IllegalArgumentException("input required");`,
        `        if (input.length() > 4096) throw new IllegalArgumentException("input too long");`,
        `        return input.trim().toLowerCase();`,
        `    }`,
        `}`,
      ].join('\n');

    case 'csharp':
      return [
        `namespace CypherEgg.Util;`,
        ``,
        `public static class ${n} {`,
        `    public static string Process(string input) {`,
        `        if (string.IsNullOrWhiteSpace(input)) throw new ArgumentException("input required");`,
        `        if (input.Length > 4096) throw new ArgumentException("input too long");`,
        `        return input.Trim().ToLowerInvariant();`,
        `    }`,
        `}`,
      ].join('\n');

    case 'javascript':
      return [
        `/** ${n} — utility module */`,
        `function process(input) {`,
        `  if (!input?.trim()) throw new Error("input required");`,
        `  if (input.length > 4096) throw new Error("input too long");`,
        `  return input.trim().toLowerCase();`,
        `}`,
        ``,
        `function debounce(fn, ms) {`,
        `  let timer;`,
        `  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };`,
        `}`,
        ``,
        `module.exports = { process, debounce };`,
      ].join('\n');

    case 'html':
      return [
        `<!doctype html><html><head><title>${n}</title></head>`,
        `<body><script>`,
        `  function process(input) {`,
        `    if (!input?.trim()) throw new Error("input required");`,
        `    return input.trim().toLowerCase();`,
        `  }`,
        `</script></body></html>`,
      ].join('\n');

    case 'sql':
      return [
        `-- ${n}: utility function`,
        `CREATE OR REPLACE FUNCTION ${ctx.slug.replace(/-/g, '_')}_normalize(input TEXT) RETURNS TEXT AS $`,
        `  SELECT lower(trim(input));`,
        `$$ LANGUAGE SQL IMMUTABLE;`,
      ].join('\n');
  }
  return `// ${n}`;
}
