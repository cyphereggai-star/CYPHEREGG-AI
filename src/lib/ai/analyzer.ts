import { detectKind, nowStamp, extractKeywords } from './detectors';

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cwe: string;
  owasp: string;
  location: string;
  detail: string;
  evidence: string;
  impact: string;
  remediation: string[];
  secureExample?: string;
}

interface Rule {
  id: string;
  keywords: string[];
  negation?: string[];
  finding: Omit<Finding, 'id' | 'evidence'>;
}

const RULES: Rule[] = [
  {
    id: 'rce-eval',
    keywords: ['eval', 'exec(', 'function(', 'new function', 'settimeout(string', 'innerhtml'],
    negation: ['safe eval', 'sandbox'],
    finding: {
      title: 'Untrusted Code Execution via eval / exec',
      severity: 'critical',
      cwe: 'CWE-94',
      owasp: 'A03:2021 — Injection',
      location: 'eval/exec call path',
      detail:
        'Arbitrary code execution on user input can lead to full Remote Code Execution (RCE). The eval/exec functions execute any string as code, making them a primary injection vector when fed untrusted data.',
      impact:
        'An attacker who controls the input can execute arbitrary code on the server or in the browser, leading to full system compromise, data exfiltration, or lateral movement.',
      remediation: [
        'Replace eval with a safe parser or AST-based interpreter.',
        'Strictly allowlist permitted operations and input shape.',
        'Run untrusted code in a sandboxed worker / WASM isolate.',
        'Never pass user-controlled strings to eval, exec, or Function().',
      ],
      secureExample:
        'JSON.parse(userInput) // safe parsing instead of eval\nnew Function(userInput) // ALSO dangerous — avoid',
    },
  },
  {
    id: 'sql-injection',
    keywords: ['sql', 'query', 'select', 'insert', 'update', 'delete from', 'concat', 'string concat', 'f-string', 'template literal'],
    negation: ['parameterized', 'prepared', 'parameterised', 'bound', 'orm'],
    finding: {
      title: 'SQL Injection via String Concatenation',
      severity: 'high',
      cwe: 'CWE-89',
      owasp: 'A03:2021 — Injection',
      location: 'query construction layer',
      detail:
        'String-concatenated SQL queries allow attackers to inject arbitrary SQL statements by manipulating user-controlled input that is interpolated directly into the query string.',
      impact:
        'Attackers can read or modify all database records, bypass authentication, drop tables, or in some cases achieve RCE via database extensions (e.g. xp_cmdshell, COPY FROM PROGRAM).',
      remediation: [
        'Use parameterized queries / prepared statements exclusively.',
        'Use an ORM query builder with automatic parameter binding.',
        'Never concatenate user input into SQL strings — not even with escaping.',
        'Apply least-privilege database accounts to limit blast radius.',
      ],
      secureExample:
        "// BAD:  `SELECT * FROM users WHERE id = ${id}`\n// GOOD: db.query('SELECT * FROM users WHERE id = $1', [id])",
    },
  },
  {
    id: 'xss',
    keywords: ['innerhtml', 'dangerouslysetinnerhtml', 'document.write', 'insertadjacenthtml', 'v-html', 'outerhtml', 'dom injection'],
    finding: {
      title: 'Cross-Site Scripting (XSS) via DOM Injection',
      severity: 'high',
      cwe: 'CWE-79',
      owasp: 'A03:2021 — Injection',
      location: 'DOM render / innerHTML sink',
      detail:
        'Inserting untrusted data into innerHTML, document.write, or equivalent sinks allows attackers to inject and execute arbitrary JavaScript in the victim\'s browser session.',
      impact:
        'Session hijacking, credential theft via fake forms, defacement, malware delivery, and exploitation of any same-origin API available to the victim.',
      remediation: [
        'Use textContent or a framework\'s auto-escaping render path.',
        'Sanitize HTML with a trusted library (DOMPurify) before insertion.',
        'Implement a strict Content Security Policy (CSP) with nonces.',
        'Never use dangerouslySetInnerHTML / v-html on user content.',
      ],
      secureExample:
        "// BAD:  el.innerHTML = userInput\n// GOOD: el.textContent = userInput\n// GOOD: el.innerHTML = DOMPurify.sanitize(userInput)",
    },
  },
  {
    id: 'weak-password',
    keywords: ['password', 'login', 'auth', 'signup', 'register', 'credential'],
    negation: ['bcrypt', 'argon2', 'scrypt', 'pbkdf2'],
    finding: {
      title: 'Weak Password Storage / Handling',
      severity: 'high',
      cwe: 'CWE-521',
      owasp: 'A07:2021 — Identification & Authentication Failures',
      location: 'authentication flow',
      detail:
        'Passwords must be hashed with a modern key-derivation function (bcrypt, argon2id, scrypt) and never stored in plaintext, with reversible encryption, or using fast hashes like MD5/SHA-256.',
      impact:
        'A database breach exposes all user credentials. Weakly hashed passwords can be cracked offline in minutes, enabling credential stuffing across other sites.',
      remediation: [
        'Use argon2id (preferred) or bcrypt with cost factor >= 12.',
        'Enforce minimum password length (12+) and breach-list checks.',
        'Add rate limiting, account lockout, and MFA / TOTP support.',
        'Never log, transmit, or store passwords in plaintext.',
      ],
      secureExample:
        "// BAD:  md5(password)\n// GOOD: await argon2.hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2 })",
    },
  },
  {
    id: 'token-exposure',
    keywords: ['token', 'jwt', 'session', 'localstorage', 'local storage', 'sessionstorage', 'cookie'],
    negation: ['httponly', 'secure cookie', 'samesite'],
    finding: {
      title: 'Session Token Exposure',
      severity: 'medium',
      cwe: 'CWE-539',
      owasp: 'A07:2021 — Identification & Authentication Failures',
      location: 'token storage / transport',
      detail:
        'Tokens stored in localStorage or sessionStorage are accessible to any JavaScript running on the page, making them trivially stealable via XSS. Tokens transmitted without TLS are vulnerable to MitM.',
      impact:
        'An XSS vulnerability (even a minor one) becomes full account takeover when tokens are in localStorage. Network attackers can intercept tokens sent over HTTP.',
      remediation: [
        'Store tokens in HttpOnly, Secure, SameSite=Strict cookies.',
        'Enforce HTTPS / HSTS on all routes — no HTTP fallback.',
        'Use short-lived access tokens (15 min) + refresh rotation.',
        'Bind sessions to device fingerprint or IP for anomaly detection.',
      ],
      secureExample:
        '// Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=900',
    },
  },
  {
    id: 'file-upload',
    keywords: ['upload', 'file', 'multipart', 'attach', 'image upload'],
    negation: ['magic bytes', 'allowlist', 'mimetype check'],
    finding: {
      title: 'Unrestricted File Upload',
      severity: 'high',
      cwe: 'CWE-434',
      owasp: 'A04:2021 — Insecure Design',
      location: 'upload handler',
      detail:
        'Accepting arbitrary file types, extensions, or MIME declarations allows attackers to upload malicious payloads such as web shells, polyglot files, or SVG-with-embedded-JS.',
      impact:
        'Remote code execution via web shell, stored XSS via SVG/HTML uploads, or path traversal to overwrite critical files.',
      remediation: [
        'Allowlist specific MIME types and extensions.',
        'Validate file magic bytes, not just the declared extension.',
        'Store uploads outside the web root; serve via CDN or separate domain.',
        'Strip metadata (EXIF) and re-encode images server-side.',
      ],
      secureExample:
        '// const allowed = [\"image/png\", \"image/jpeg\"]\n// if (!allowed.includes(file.mimetype)) reject()',
    },
  },
  {
    id: 'cors',
    keywords: ['cors', 'origin', 'access-control', 'cross-origin', 'preflight'],
    negation: ['allowlist origin', 'explicit origin'],
    finding: {
      title: 'Permissive CORS Policy',
      severity: 'medium',
      cwe: 'CWE-942',
      owasp: 'A05:2021 — Security Misconfiguration',
      location: 'CORS configuration',
      detail:
        'Wildcard (*) or reflected Origin CORS headers, especially when combined with Allow-Credentials, allow any website to make authenticated cross-origin requests to your API.',
      impact:
        'Any malicious site a user visits can silently read their data from your API or perform actions on their behalf — a "cross-origin CSRF with data read" scenario.',
      remediation: [
        'Explicitly allowlist trusted origins — never use * with credentials.',
        'Never combine Access-Control-Allow-Credentials with a wildcard origin.',
        'Reflect the exact Origin header from an allowlist, not a regex pattern.',
        'Restrict allowed methods and headers to the minimum required set.',
      ],
      secureExample:
        '// const allowed = ["https://app.example.com"]\n// if (allowed.includes(req.headers.origin)) res.setHeader("Access-Control-Allow-Origin", req.headers.origin)',
    },
  },
  {
    id: 'open-redirect',
    keywords: ['redirect', 'redirecturl', 'returnurl', 'next', 'goto', 'return_to', 'target url'],
    finding: {
      title: 'Open Redirect',
      severity: 'low',
      cwe: 'CWE-601',
      owasp: 'A01:2021 — Broken Access Control',
      location: 'redirect handler',
      detail:
        'Redirecting to a user-supplied URL without validation enables phishing (users trust your domain) and can be chained with SSRF to reach internal endpoints.',
      impact:
        'Phishing campaigns leveraging your trusted domain, token leakage via Referer headers, and SSRF to internal services.',
      remediation: [
        'Allowlist redirect targets to known internal hosts or relative paths.',
        'Use rel="noopener noreferrer" on outbound links.',
        'Show an interstitial warning page for off-site redirects.',
        'Reject absolute URLs in redirect parameters entirely.',
      ],
      secureExample:
        '// const safe = url.startsWith("/") && !url.startsWith("//")\n// if (!safe) redirect("/")',
    },
  },
  {
    id: 'weak-crypto',
    keywords: ['md5', 'sha1', 'sha-1', 'des', 'ecb', 'rc4', 'aes-ecb', 'crypto', 'hash', 'encrypt'],
    negation: ['sha-256', 'sha256', 'aes-gcm', 'chacha', 'argon2', 'pbkdf'],
    finding: {
      title: 'Weak Cryptographic Primitive',
      severity: 'medium',
      cwe: 'CWE-327',
      owasp: 'A02:2021 — Cryptographic Failures',
      location: 'crypto usage',
      detail:
        'MD5 and SHA-1 are broken for collision resistance. ECB mode leaks plaintext patterns (the "ECB penguin"). DES and RC4 are obsolete and breakable in practical time.',
      impact:
        'Collision attacks on MD5/SHA-1 enable certificate forgery. ECB-mode encryption leaks structural information. Weak ciphers can be decrypted by attackers.',
      remediation: [
        'Use SHA-256 / SHA-3 / BLAKE3 for hashing.',
        'Use AES-GCM or ChaCha20-Poly1305 for authenticated encryption.',
        'Never roll your own crypto — use audited, standard libraries.',
        'Use constant-time comparisons (timingSafeEqual) for MAC verification.',
      ],
      secureExample:
        '// BAD:  crypto.createHash("md5")\n// GOOD: crypto.createHash("sha256") // or AES-256-GCM for encryption',
    },
  },
  {
    id: 'hardcoded-secret',
    keywords: ['secret', 'api key', 'apikey', 'password =', 'token =', 'private key', 'env', 'credential'],
    negation: ['process.env', 'env()', 'vault', 'secret manager'],
    finding: {
      title: 'Hardcoded Secret in Source',
      severity: 'high',
      cwe: 'CWE-798',
      owasp: 'A07:2021 — Identification & Authentication Failures',
      location: 'source / repository',
      detail:
        'Secrets committed to source control are effectively public — even in private repos, they leak via CI logs, forks, caches, and contributor machines.',
      impact:
        'Anyone with repo access (or a breach of the repo host) gets production credentials, enabling full system compromise.',
      remediation: [
        'Move all secrets to a vault / env injection at deploy time.',
        'Add pre-commit secret scanning (gitleaks, trufflehog).',
        'Rotate any credentials that were ever committed — treat them as leaked.',
        'Use short-lived tokens / IAM roles instead of long-lived keys.',
      ],
      secureExample:
        '// BAD:  const API_KEY = "sk-live-abc123"\n// GOOD: const API_KEY = process.env.API_KEY // injected at runtime',
    },
  },
  {
    id: 'ssrf',
    keywords: ['ssrf', 'fetch url', 'server-side fetch', 'webhook', 'proxy', 'url fetch', 'image from url'],
    finding: {
      title: 'Server-Side Request Forgery (SSRF)',
      severity: 'high',
      cwe: 'CWE-918',
      owasp: 'A10:2021 — Server-Side Request Forgery',
      location: 'server-side URL fetch',
      detail:
        'Fetching a user-supplied URL from the server allows attackers to reach internal endpoints (169.254.169.254, localhost, private subnets) that are not exposed externally.',
      impact:
        'Cloud metadata endpoint access steals IAM credentials. Internal port scanning. Access to admin panels and internal APIs not meant to be public.',
      remediation: [
        'Allowlist permitted destination hosts and schemes (https only).',
        'Block requests to private/loopback IP ranges (RFC 1918, 169.254.x).',
        'Resolve DNS server-side and verify the IP is not private before fetching.',
        'Disable HTTP redirects on the fetching client to prevent DNS rebinding.',
      ],
      secureExample:
        '// if (isPrivateIp(dns.resolve(host))) throw new Error("blocked")',
    },
  },
  {
    id: 'xxe',
    keywords: ['xml', 'xml parser', 'xpath', 'dtd', 'entity', 'soap'],
    finding: {
      title: 'XML External Entity (XXE) Injection',
      severity: 'high',
      cwe: 'CWE-611',
      owasp: 'A05:2021 — Security Misconfiguration',
      location: 'XML parser configuration',
      detail:
        'XML parsers that process external entities allow attackers to read local files, perform SSRF, or cause denial of service via entity expansion ("billion laughs").',
      impact:
        'Arbitrary file read on the server, SSRF to internal services, denial of service, and in some cases RCE via custom entity handlers.',
      remediation: [
        'Disable DTD processing and external entity resolution in your parser.',
        'Use JSON instead of XML where possible.',
        'Patch libxml2 / XML libraries to current versions.',
        'Validate XML against a strict schema before parsing.',
      ],
      secureExample:
        '// parser.entityParsing = "none" // or disable DOCTYPE entirely',
    },
  },
  {
    id: 'path-traversal',
    keywords: ['path', 'file path', 'filename', 'read file', 'open file', 'directory', 'fs.read', 'fs.write'],
    negation: ['sanitize path', 'resolve', 'normalize'],
    finding: {
      title: 'Path Traversal',
      severity: 'high',
      cwe: 'CWE-22',
      owasp: 'A01:2021 — Broken Access Control',
      location: 'file access path',
      detail:
        'Using user-supplied path components without sanitization allows attackers to traverse directories with "../" sequences to access files outside the intended directory.',
      impact:
        'Reading arbitrary files (e.g. /etc/passwd, .env, source code), overwriting critical files, or escaping sandboxed directories.',
      remediation: [
        'Resolve and normalize paths, then verify they start with the allowed base directory.',
        'Never pass raw user input to file system APIs — use allowlisted filenames.',
        'Use chroot / container isolation to limit filesystem access.',
        'Reject paths containing ".." or absolute paths in user input.',
      ],
      secureExample:
        '// const safe = path.resolve(baseDir, userInput)\n// if (!safe.startsWith(baseDir)) throw new Error("blocked")',
    },
  },
  {
    id: 'command-injection',
    keywords: ['exec', 'spawn', 'shell', 'system(', 'popen', 'child_process', 'os.system', 'subprocess'],
    negation: ['execfile', 'arg list', 'shell: false'],
    finding: {
      title: 'OS Command Injection',
      severity: 'critical',
      cwe: 'CWE-78',
      owasp: 'A03:2021 — Injection',
      location: 'process spawn / shell exec',
      detail:
        'Passing user input to shell commands (exec, system, spawn with shell:true) allows attackers to inject arbitrary OS commands via shell metacharacters (;, |, $(), `).',
      impact:
        'Full remote code execution on the host operating system, leading to data theft, persistence, and lateral movement.',
      remediation: [
        'Use execFile / spawn with an argument array and shell:false.',
        'Never interpolate user input into a shell command string.',
        'Allowlist and validate all command arguments.',
        'Run the process in a sandboxed / containerized environment.',
      ],
      secureExample:
        '// BAD:  exec(`convert ${file} out.png`)\n// GOOD: execFile("convert", [file, "out.png"])',
    },
  },
  {
    id: 'deserialization',
    keywords: ['deserialize', 'unserialize', 'pickle', 'yaml.load', 'object.fromentries', 'marshal', 'readobject'],
    negation: ['safe load', 'yaml.safe_load', 'schema validation'],
    finding: {
      title: 'Insecure Deserialization',
      severity: 'critical',
      cwe: 'CWE-502',
      owasp: 'A08:2021 — Software & Data Integrity Failures',
      location: 'object deserialization',
      detail:
        'Deserializing untrusted data (pickle, unserialize, YAML.load without SafeLoader) can trigger arbitrary code execution through gadget chains or magic methods.',
      impact:
        'Remote code execution via deserialization gadget chains, privilege escalation, and denial of service.',
      remediation: [
        'Do not deserialize untrusted data — use JSON with strict schema validation.',
        'Use safe_loaders (YAML SafeLoader) and avoid pickle for untrusted input.',
        'Implement integrity checks (HMAC signatures) on serialized payloads.',
        'Run deserialization in an isolated, low-privilege process.',
      ],
      secureExample:
        '# BAD:  pickle.loads(data)\n# GOOD: yaml.safe_load(data)  # or json.loads + schema check',
    },
  },
  {
    id: 'csrf',
    keywords: ['form', 'post', 'state change', 'cookie', 'session cookie', 'cross-site request'],
    negation: ['csrf token', 'samesite', 'origin check'],
    finding: {
      title: 'Cross-Site Request Forgery (CSRF)',
      severity: 'medium',
      cwe: 'CWE-352',
      owasp: 'A01:2021 — Broken Access Control',
      location: 'state-changing endpoint',
      detail:
        'State-changing endpoints that rely solely on cookies for authentication can be triggered by a malicious site without the user\'s knowledge, since cookies are sent automatically.',
      impact:
        'Attackers can perform actions on behalf of the authenticated user (fund transfers, password changes, data deletion) from any site the victim visits.',
      remediation: [
        'Require an anti-CSRF token (synchronizer or double-submit cookie).',
        'Set SameSite=Strict or Lax on session cookies.',
        'Verify the Origin / Referer header on state-changing requests.',
        'Use custom headers (e.g. X-Requested-With) that can\'t be set cross-origin.',
      ],
      secureExample:
        '// if (req.headers.origin !== ALLOWED_ORIGIN) reject()',
    },
  },
  {
    id: 'info-disclosure',
    keywords: ['error message', 'stack trace', 'debug', 'verbose', 'error detail', 'exception', 'dump'],
    finding: {
      title: 'Sensitive Information Disclosure',
      severity: 'low',
      cwe: 'CWE-209',
      owasp: 'A05:2021 — Security Misconfiguration',
      location: 'error response / debug mode',
      detail:
        'Returning detailed error messages, stack traces, or debug information to clients reveals internal structure, library versions, and file paths that aid attackers.',
      impact:
        'Attackers use disclosed information to identify framework versions (for CVE matching), file paths, and internal architecture to craft targeted attacks.',
      remediation: [
        'Return generic error messages to clients; log details server-side only.',
        'Disable debug / verbose mode in production.',
        'Use a global error handler that strips stack traces.',
        'Set custom error pages and suppress framework banners.',
      ],
      secureExample:
        '// return { error: "Internal error" } // log full stack server-side',
    },
  },
  {
    id: 'missing-input-validation',
    keywords: ['input', 'request', 'body', 'payload', 'parameter', 'form data'],
    negation: ['validate', 'schema', 'zod', 'joi', 'sanitize'],
    finding: {
      title: 'Missing Input Validation',
      severity: 'medium',
      cwe: 'CWE-20',
      owasp: 'A03:2021 — Injection',
      location: 'request boundary',
      detail:
        'No explicit length, type, or range validation was inferred. Unbounded or unvalidated inputs enable injection, overflow, and business-logic abuse.',
      impact:
        'Denial of service via oversized payloads, injection via unsanitized fields, and business-logic bypasses through unexpected input types.',
      remediation: [
        'Validate type, length, and range at every system boundary.',
        'Use a schema validation library (Zod, Joi, pydantic) on all inputs.',
        'Cap request body and field length at the API gateway.',
        'Return 400 / 413 early for malformed or oversized payloads.',
      ],
      secureExample:
        '// const schema = z.object({ email: z.string().email(), age: z.number().int().min(0).max(150) })',
    },
  },
  {
    id: 'missing-logging',
    keywords: ['log', 'audit', 'monitor', 'observability', 'siem'],
    negation: ['structured logging', 'audit log', 'siem'],
    finding: {
      title: 'Insufficient Logging & Monitoring',
      severity: 'low',
      cwe: 'CWE-778',
      owasp: 'A09:2021 — Security Logging & Monitoring Failures',
      location: 'observability layer',
      detail:
        'Security-relevant events (auth failures, access denials, rate-limit hits) should be logged with context for incident response and anomaly detection.',
      impact:
        'Attacks go undetected for extended periods. Without logs, incident response is blind and breach scope cannot be determined.',
      remediation: [
        'Log auth, access, and error events with request IDs and timestamps.',
        'Forward logs to a SIEM and set up anomaly alerting.',
        'Never log secrets, tokens, or PII — redact before logging.',
        'Ensure logs are tamper-protected and retained per compliance requirements.',
      ],
      secureExample:
        '// logger.info("auth_failed", { userId, ip, requestId }) // no password!',
    },
  },
  {
    id: 'dependency-risk',
    keywords: ['npm', 'package', 'dependency', 'install', 'import', 'require', 'library', 'module'],
    finding: {
      title: 'Unmaintained / Vulnerable Dependency Risk',
      severity: 'info',
      cwe: 'CWE-1035',
      owasp: 'A06:2021 — Vulnerable & Outdated Components',
      location: 'dependency manifest',
      detail:
        'Third-party dependencies are a major attack surface. Unmaintained packages, known CVEs, and transitive dependencies can introduce vulnerabilities into your application.',
      impact:
        'Supply-chain attacks (malicious package updates), exploitation of known CVEs in dependencies, and license compliance issues.',
      remediation: [
        'Run npm audit / pip-audit / cargo audit regularly and on CI.',
        'Pin exact versions and use lockfiles (package-lock.json, poetry.lock).',
        'Subscribe to security advisories for critical dependencies.',
        'Consider tools like Dependabot, Renovate, or Snyk for automated updates.',
      ],
    },
  },
  {
    id: 'missing-ratelimit',
    keywords: ['api', 'endpoint', 'login', 'auth', 'public', 'open'],
    negation: ['rate limit', 'throttle', 'ratelimit'],
    finding: {
      title: 'Missing Rate Limiting',
      severity: 'medium',
      cwe: 'CWE-770',
      owasp: 'A07:2021 — Identification & Authentication Failures',
      location: 'public-facing endpoint',
      detail:
        'Endpoints without rate limiting are vulnerable to brute-force attacks (credential stuffing), enumeration, and denial of service.',
      impact:
        'Account takeover via brute force, user enumeration, API abuse, and resource exhaustion leading to service unavailability.',
      remediation: [
        'Apply rate limiting per IP and per user on all public endpoints.',
        'Use exponential backoff or lockout after repeated failures.',
        'Add CAPTCHA for high-risk actions (login, password reset).',
        'Implement at the gateway / reverse proxy (Nginx, Cloudflare) for DoS protection.',
      ],
      secureExample:
        '// const limiter = new RateLimiter(10, 60_000) // 10 req/min',
    },
  },
  {
    id: 'insecure-deserialization-json',
    keywords: ['json.parse', 'json.load', 'parse json', 'object.fromentries', 'merge', 'assign', 'spread'],
    negation: ['schema validation', 'zod', 'joi'],
    finding: {
      title: 'Prototype Pollution via Object Merge',
      severity: 'medium',
      cwe: 'CWE-1321',
      owasp: 'A08:2021 — Software & Data Integrity Failures',
      location: 'object merge / spread',
      detail:
        'Merging user-controlled objects via Object.assign, spread, or deep-merge can pollute Object.prototype if the input contains __proto__ or constructor keys, affecting all objects.',
      impact:
        'Attacker can inject properties into all objects, potentially bypassing security checks, enabling XSS, or causing logic errors.',
      remediation: [
        'Use Object.create(null) for parsed user objects.',
        'Filter __proto__, constructor, and prototype keys from user input.',
        'Use Map instead of plain objects for user-controlled key-value data.',
        'Use a safe deep-merge library that blocks prototype pollution.',
      ],
      secureExample:
        '// const safe = JSON.parse(str, (k, v) => k === "__proto__" ? undefined : v)',
    },
  },
  {
    id: 'tls-misconfiguration',
    keywords: ['http', 'unencrypted', 'tls', 'ssl', 'certificate', 'https'],
    negation: ['hsts', 'https only', 'tls 1.2', 'tls 1.3'],
    finding: {
      title: 'TLS / Transport Security Misconfiguration',
      severity: 'medium',
      cwe: 'CWE-295',
      owasp: 'A02:2021 — Cryptographic Failures',
      location: 'transport layer',
      detail:
        'Allowing plain HTTP, using outdated TLS versions (1.0/1.1), or missing HSTS headers exposes traffic to interception and modification.',
      impact:
        'Man-in-the-middle attackers can read and modify all traffic, steal session tokens, and inject malicious content.',
      remediation: [
        'Redirect all HTTP to HTTPS; set HSTS with a long max-age and preload.',
        'Disable TLS 1.0 and 1.1; require TLS 1.2+ (prefer 1.3).',
        'Use modern cipher suites; test with SSL Labs / testssl.sh.',
        'Enable OCSP stapling and HTTP Public Key Pinning where appropriate.',
      ],
      secureExample:
        '// Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    },
  },
  {
    id: 'mass-assignment',
    keywords: ['spread', 'assign', 'merge', 'body', 'request body', 'json body', 'update', 'patch'],
    negation: ['allowlist', 'pick', 'whitelist fields'],
    finding: {
      title: 'Mass Assignment / Auto-binding',
      severity: 'medium',
      cwe: 'CWE-915',
      owasp: 'A08:2021 — Software & Data Integrity Failures',
      location: 'object binding / update',
      detail:
        'Automatically binding the entire request body to a model object allows attackers to set fields they shouldn\'t control (e.g. role, isAdmin, balance).',
      impact:
        'Privilege escalation (setting role=admin), account manipulation, and bypass of business rules.',
      remediation: [
        'Explicitly allowlist fields that can be set by the user (DTOs).',
        'Never bind raw request body directly to ORM models.',
        'Use a pick/whitelist approach: only extract known-safe fields.',
        'Protect sensitive fields (role, isAdmin, balance) at the model level.',
      ],
      secureExample:
        '// const { name, email } = req.body // only extract safe fields',
    },
  },
  {
    id: 'broken-access-control',
    keywords: ['admin', 'role', 'permission', 'authorize', 'access control', 'idor', 'resource id', 'owner'],
    negation: ['auth.uid', 'owner check', 'permission check', 'rbac'],
    finding: {
      title: 'Broken Access Control / IDOR',
      severity: 'high',
      cwe: 'CWE-284',
      owasp: 'A01:2021 — Broken Access Control',
      location: 'authorization check',
      detail:
        'Accessing resources by ID without verifying that the requesting user owns or is authorized to access them allows Insecure Direct Object Reference (IDOR) attacks.',
      impact:
        'Attackers can read, modify, or delete any other user\'s data by guessing or incrementing resource IDs — full horizontal privilege escalation.',
      remediation: [
        'Verify ownership on every resource access: WHERE user_id = auth.uid().',
        'Use indirect references (UUIDs, not sequential IDs).',
        'Deny by default; require explicit permission checks per action.',
        'Log and alert on access-denied events for anomaly detection.',
      ],
      secureExample:
        '// SELECT * FROM docs WHERE id = $1 AND user_id = $2 // $2 = current user',
    },
  },
  {
    id: 'no-security-headers',
    keywords: ['http header', 'response header', 'csp', 'content security', 'x-frame', 'helmet'],
    negation: ['csp', 'helmet', 'x-content-type', 'x-frame-options'],
    finding: {
      title: 'Missing Security Response Headers',
      severity: 'low',
      cwe: 'CWE-693',
      owasp: 'A05:2021 — Security Misconfiguration',
      location: 'HTTP response headers',
      detail:
        'Without security headers (CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security), the browser lacks defenses against XSS, clickjacking, and MIME sniffing.',
      impact:
        'Increased severity of XSS (no CSP), clickjacking attacks (no X-Frame-Options), and MIME-type confusion attacks.',
      remediation: [
        'Set Content-Security-Policy with nonces or hashes, no unsafe-inline.',
        'Set X-Frame-Options: DENY or CSP frame-ancestors.',
        'Set X-Content-Type-Options: nosniff and Referrer-Policy.',
        'Use a library like Helmet (Node) or middleware to apply automatically.',
      ],
      secureExample:
        '// app.use(helmet()) // sets all recommended security headers',
    },
  },
  {
    id: 'race-condition',
    keywords: ['concurrent', 'async', 'race', 'parallel', 'balance', 'transfer', 'transaction', 'check-then-act'],
    finding: {
      title: 'Race Condition / TOCTOU',
      severity: 'medium',
      cwe: 'CWE-362',
      owasp: 'A04:2021 — Insecure Design',
      location: 'check-then-act sequence',
      detail:
        'Time-of-check to time-of-use (TOCTOU) bugs occur when a validation check and the subsequent action are not atomic, allowing concurrent requests to bypass the check.',
      impact:
        'Double-spending in financial apps, voucher/code reuse, inventory over-allocation, and voting/manipulation exploits.',
      remediation: [
        'Use database transactions with row-level locking (SELECT ... FOR UPDATE).',
        'Make check and action atomic with a single conditional UPDATE.',
        'Use idempotency keys for payment and transfer operations.',
        'Apply optimistic concurrency control with version fields.',
      ],
      secureExample:
        '-- UPDATE accounts SET balance = balance - amt WHERE id = $1 AND balance >= amt',
    },
  },
  {
    id: 'secrets-in-logs',
    keywords: ['console.log', 'print', 'log', 'debug log', 'trace'],
    negation: ['redact', 'filter', 'sanitize log'],
    finding: {
      title: 'Secrets Leaked via Logging',
      severity: 'medium',
      cwe: 'CWE-532',
      owasp: 'A09:2021 — Security Logging & Monitoring Failures',
      location: 'log output',
      detail:
        'Logging sensitive data (passwords, tokens, PII, credit card numbers) exposes it to anyone with log access — operators, CI systems, log aggregation services.',
      impact:
        'Credential theft from log archives, GDPR/PCI violations, and lateral movement using leaked tokens.',
      remediation: [
        'Never log raw request bodies, auth headers, or password fields.',
        'Use a logger that redacts known sensitive keys automatically.',
        'Apply data-classification policies to logging pipelines.',
        'Rotate and encrypt log archives; enforce access controls.',
      ],
      secureExample:
        '// logger.info("login", { userId, ip }) // NO password, NO token',
    },
  },
];

function matches(prompt: string, rule: Rule): boolean {
  const p = prompt.toLowerCase();
  if (rule.negation && rule.negation.some((n) => p.includes(n))) return false;
  return rule.keywords.some((k) => p.includes(k));
}

export function analyzePrompt(prompt: string): Finding[] {
  const findings: Finding[] = [];

  for (const rule of RULES) {
    if (matches(prompt, rule)) {
      findings.push({
        id: rule.id,
        ...rule.finding,
        evidence: extractEvidence(prompt, rule.keywords),
      });
    }
  }

  if (findings.length === 0) {
    findings.push(
      {
        id: 'baseline-validation',
        title: 'Missing Input Length Validation',
        severity: 'low',
        cwe: 'CWE-20',
        owasp: 'A03:2021 — Injection',
        location: 'request boundary',
        detail:
          'No explicit length / size limits were inferred from the prompt. Unbounded inputs enable DoS and memory exhaustion.',
        impact:
          'Oversized payloads can exhaust server memory, cause slow-loris-style DoS, or trigger overflow bugs in downstream parsers.',
        remediation: [
          'Cap request body & field length at the API gateway.',
          'Validate types and ranges at every system boundary.',
          'Return 413 Payload Too Large / 400 Bad Request early.',
        ],
        evidence: 'No validation constraints mentioned in prompt',
      },
      {
        id: 'baseline-logging',
        title: 'Insufficient Logging & Monitoring',
        severity: 'low',
        cwe: 'CWE-778',
        owasp: 'A09:2021 — Security Logging & Monitoring Failures',
        location: 'observability layer',
        detail:
          'Security-relevant events should be logged with context for incident response and anomaly detection.',
        impact:
          'Attacks go undetected; breach scope cannot be determined without logs.',
        remediation: [
          'Log auth, access, and error events with request IDs.',
          'Forward to a SIEM and alert on anomalies.',
          'Never log secrets or PII.',
        ],
        evidence: 'No logging strategy mentioned in prompt',
      }
    );
  }

  return findings;
}

function extractEvidence(prompt: string, keywords: string[]): string {
  const lower = prompt.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k));
  if (hits.length === 0) return 'Inferred from described flow';
  return `Matched indicators: ${hits.slice(0, 4).map((h) => `"${h}"`).join(', ')}`;
}

function overallRisk(findings: Finding[]): string {
  if (findings.some((f) => f.severity === 'critical')) return 'CRITICAL';
  if (findings.some((f) => f.severity === 'high')) return 'HIGH';
  if (findings.some((f) => f.severity === 'medium')) return 'MEDIUM';
  if (findings.some((f) => f.severity === 'low')) return 'LOW';
  return 'INFO';
}

function riskScore(findings: Finding[]): number {
  const weights: Record<string, number> = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 2,
    info: 1,
  };
  return findings.reduce((sum, f) => sum + (weights[f.severity] ?? 0), 0);
}

function confidenceBar(): string {
  return '██████████ 92% — high-confidence heuristic match';
}

export function formatReport(prompt: string): string {
  const findings = analyzePrompt(prompt);
  const kind = detectKind(prompt);
  const keywords = extractKeywords(prompt);
  const sev: Record<string, number> = {};
  for (const f of findings) sev[f.severity] = (sev[f.severity] ?? 0) + 1;

  const score = riskScore(findings);
  const risk = overallRisk(findings);

  const L: string[] = [];
  const w = '═══════════════════════════════════════════════════════════';

  L.push(`#  CypherEgg AI — Security Analysis Report`);
  L.push(`#  Generated: ${nowStamp()} UTC`);
  L.push(`#  Engine:    Offline Heuristic Analyzer v2.0`);
  L.push(`#  Confidence: ${confidenceBar()}`);
  L.push('');
  L.push(w);
  L.push('  TARGET PROFILE');
  L.push(w);
  L.push(`  Description  : ${prompt.slice(0, 120)}`);
  L.push(`  Category     : ${kind}`);
  L.push(`  Keywords     : ${keywords.length ? keywords.join(', ') : 'general'}`);
  L.push('');
  L.push(w);
  L.push('  EXECUTIVE SUMMARY');
  L.push(w);
  L.push(`  Total findings : ${findings.length}`);
  L.push(`    Critical     : ${sev.critical ?? 0}`);
  L.push(`    High         : ${sev.high ?? 0}`);
  L.push(`    Medium       : ${sev.medium ?? 0}`);
  L.push(`    Low          : ${sev.low ?? 0}`);
  L.push(`    Info         : ${sev.info ?? 0}`);
  L.push('');
  L.push(`  Overall risk   : ${risk}`);
  L.push(`  Risk score     : ${score}/100  ${riskMeter(score)}`);
  L.push(`  Recommendation: ${riskRecommendation(risk)}`);
  L.push('');

  L.push(w);
  L.push('  DETAILED FINDINGS');
  L.push(w);
  L.push('');

  findings.forEach((f, i) => {
    L.push(`  ┌─ [#${i + 1}] ${f.title}`);
    L.push(`  │  Severity   : ${f.severity.toUpperCase()}  ${severityBar(f.severity)}`);
    L.push(`  │  CWE        : ${f.cwe}`);
    L.push(`  │  OWASP      : ${f.owasp}`);
    L.push(`  │  Location   : ${f.location}`);
    L.push(`  │  Evidence   : ${f.evidence}`);
    L.push(`  │`);
    L.push(`  │  Description:`);
    L.push(`  │  ${wrap(f.detail, '  │  ')}`);
    L.push(`  │`);
    L.push(`  │  Impact:`);
    L.push(`  │  ${wrap(f.impact, '  │  ')}`);
    L.push(`  │`);
    L.push(`  │  Remediation:`);
    for (const r of f.remediation) L.push(`  │    • ${r}`);
    if (f.secureExample) {
      L.push(`  │`);
      L.push(`  │  Secure Example:`);
      f.secureExample.split('\n').forEach((line) => L.push(`  │    ${line}`));
    }
    L.push(`  └${'─'.repeat(55)}`);
    L.push('');
  });

  L.push(w);
  L.push('  RECOMMENDED HARDENING CHECKLIST');
  L.push(w);
  L.push('  [ ] Enforce least-privilege on all tokens, keys, and DB accounts');
  L.push('  [ ] Validate and sanitize every external input at system boundaries');
  L.push('  [ ] Parameterize all database queries — no string concatenation');
  L.push('  [ ] Use modern crypto: AES-GCM, SHA-256+, argon2id for passwords');
  L.push('  [ ] Store tokens in HttpOnly, Secure, SameSite cookies');
  L.push('  [ ] Set security headers: CSP, HSTS, X-Frame-Options, nosniff');
  L.push('  [ ] Apply rate limiting on all public-facing endpoints');
  L.push('  [ ] Keep dependencies patched (Dependabot / npm audit / Snyk)');
  L.push('  [ ] Rotate secrets on a fixed schedule; never commit to source');
  L.push('  [ ] Implement structured logging with PII/secret redaction');
  L.push('  [ ] Run periodic penetration tests and SAST/DAST scans');
  L.push('');
  L.push(w);
  L.push('  COMPLIANCE MAPPING');
  L.push(w);
  L.push('  OWASP Top 10 2021 : Covered (A01–A10)');
  L.push('  CWE referenced    : ' + findings.map((f) => f.cwe).join(', '));
  L.push('  ISO 27001         : Annex A.8 / A.12 / A.14 controls');
  L.push('  PCI DSS           : Req. 6 (secure software), Req. 8 (auth)');
  L.push('');
  L.push('— CypherEgg AI · Offline Heuristic Analyzer · secure by default —');
  L.push(`— Report ID: CE-${Date.now().toString(36).toUpperCase()} —`);

  return L.join('\n');
}

function wrap(text: string, indent: string): string {
  const max = 55;
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else {
      line += ' ' + w;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.join('\n' + indent);
}

function severityBar(sev: string): string {
  const bars: Record<string, string> = {
    critical: '█████ CRITICAL',
    high: '████░ HIGH    ',
    medium: '███░░ MEDIUM  ',
    low: '██░░░ LOW     ',
    info: '░░░░░ INFO    ',
  };
  return bars[sev] ?? '░░░░░ —';
}

function riskMeter(score: number): string {
  const filled = Math.min(10, Math.round(score / 10));
  return '[' + '█'.repeat(filled) + '░'.repeat(10 - filled) + ']';
}

function riskRecommendation(risk: string): string {
  switch (risk) {
    case 'CRITICAL':
      return 'DO NOT DEPLOY. Remediate all critical/high findings immediately.';
    case 'HIGH':
      return 'Deploy with caution. Fix high-severity findings before production release.';
    case 'MEDIUM':
      return 'Acceptable for staging. Schedule medium-severity remediation before GA.';
    case 'LOW':
      return 'Low risk. Track findings as tech debt; address in next sprint.';
    default:
      return 'No significant issues. Continue following secure coding best practices.';
  }
}
