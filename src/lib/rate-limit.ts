interface LoginAttempt {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

export function checkLoginAttempts(email: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (!attempt) {
    return true;
  }

  if (now >= attempt.resetTime) {
    loginAttempts.delete(email);
    return true;
  }

  return attempt.count < MAX_ATTEMPTS;
}

export function recordFailedLogin(email: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (!attempt) {
    loginAttempts.set(email, {
      count: 1,
      resetTime: now + LOCK_TIME_MS,
    });
  } else {
    attempt.count += 1;
  }
}

export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

export function getAttemptsRemaining(email: string): number {
  const attempt = loginAttempts.get(email);
  if (!attempt) {
    return MAX_ATTEMPTS;
  }

  if (Date.now() >= attempt.resetTime) {
    loginAttempts.delete(email);
    return MAX_ATTEMPTS;
  }

  return Math.max(0, MAX_ATTEMPTS - attempt.count);
}
