interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts = 10, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return false
    }

    if (now > entry.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return false
    }

    if (entry.count >= this.maxAttempts) {
      return true
    }

    entry.count++
    return false
  }

  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxAttempts
    }
    return Math.max(0, this.maxAttempts - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return 0
    }
    return entry.resetTime
  }

  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    loginRateLimiter.cleanup()
  },
  5 * 60 * 1000,
)
