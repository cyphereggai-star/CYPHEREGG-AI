/**
 * Input sanitization utilities to prevent XSS and script injection.
 * Used at all user-input boundaries before values reach the UI or database.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/** Escape HTML-special characters to prevent DOM injection. */
export function escapeHtml(input: string): string {
  if (!input) return '';
  return String(input).replace(/[&<>"'`/=]/g, (ch) => HTML_ENTITY_MAP[ch] ?? ch);
}

/**
 * Sanitize a text input: trim, collapse control chars, strip script-like
 * patterns, and cap length. Safe to store and display.
 */
export function sanitizeText(input: string, maxLength = 2000): string {
  if (!input) return '';
  let s = String(input).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  s = s.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  s = s.replace(/\bjavascript:\s?/gi, '');
  s = s.replace(/\bon\w+\s*=\s*"[^"]*"/gi, '');
  s = s.replace(/\bon\w+\s*=\s*'[^']*'/gi, '');
  s = s.trim();
  if (s.length > maxLength) s = s.slice(0, maxLength);
  return s;
}

/** Strip angle-bracket tags entirely (for prompts that must never carry HTML). */
export function stripTags(input: string, maxLength = 2000): string {
  if (!input) return '';
  let s = String(input).replace(/<[^>]*>/g, '');
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  s = s.trim();
  if (s.length > maxLength) s = s.slice(0, maxLength);
  return s;
}

/** Validate an email address without throwing. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
