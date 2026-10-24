import { NextRequest } from 'next/server';

interface AttemptRecord {
  failures: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
}

// In-memory rate limiting map for PIN attempts
const pinAttempts = new Map<string, AttemptRecord>();

// Parameters: 5 failures max in 10 minutes -> 15 minutes lockout
const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Extracts the real client IP address from request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Checks if client is currently locked out from attempting PIN checks
 */
export function checkRateLimit(ip: string): { blocked: boolean; remainingSeconds: number } {
  const record = pinAttempts.get(ip);
  const now = Date.now();

  if (!record) {
    return { blocked: false, remainingSeconds: 0 };
  }

  // Check if still locked out
  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { blocked: true, remainingSeconds };
  }

  // If lockout expired or window expired, reset
  if (record.blockedUntil && record.blockedUntil <= now) {
    pinAttempts.delete(ip);
    return { blocked: false, remainingSeconds: 0 };
  }

  if (now - record.firstAttemptAt > WINDOW_MS) {
    pinAttempts.delete(ip);
    return { blocked: false, remainingSeconds: 0 };
  }

  return { blocked: false, remainingSeconds: 0 };
}

/**
 * Records a failed attempt for an IP
 */
export function recordFailedAttempt(ip: string): {
  remainingAttempts: number;
  isBlocked: boolean;
  lockoutMinutes?: number;
} {
  const now = Date.now();
  const record = pinAttempts.get(ip);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    pinAttempts.set(ip, {
      failures: 1,
      firstAttemptAt: now,
      blockedUntil: null,
    });
    return {
      remainingAttempts: MAX_FAILURES - 1,
      isBlocked: false,
    };
  }

  record.failures += 1;

  if (record.failures >= MAX_FAILURES) {
    record.blockedUntil = now + LOCKOUT_MS;
    return {
      remainingAttempts: 0,
      isBlocked: true,
      lockoutMinutes: Math.round(LOCKOUT_MS / 60000),
    };
  }

  return {
    remainingAttempts: MAX_FAILURES - record.failures,
    isBlocked: false,
  };
}

/**
 * Clears failed attempts upon successful login/verification
 */
export function recordSuccessfulAttempt(ip: string): void {
  pinAttempts.delete(ip);
}

/**
 * Sanitizes external product URLs to prevent XSS (javascript: etc.)
 */
export function sanitizeHttpUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
