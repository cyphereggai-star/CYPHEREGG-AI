import { useCallback, useRef } from 'react';

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

interface RateLimitState {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Client-side sliding-window rate limiter.
 * Returns a `check()` function that returns whether the action is allowed
 * within the configured window. Persists across renders via a ref.
 */
export function useRateLimiter({ max, windowMs }: RateLimitOptions) {
  const timestamps = useRef<number[]>([]);

  const check = useCallback((): RateLimitState => {
    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = timestamps.current.filter((t) => t > cutoff);
    timestamps.current = recent;

    if (recent.length >= max) {
      const oldest = recent[0];
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((oldest + windowMs - now) / 1000),
      };
    }

    timestamps.current.push(now);
    return {
      allowed: true,
      remaining: max - timestamps.current.length,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }, [max, windowMs]);

  const reset = useCallback(() => {
    timestamps.current = [];
  }, []);

  return { check, reset };
}
