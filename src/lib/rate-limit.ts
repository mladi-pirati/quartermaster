import { db } from '@/db'
import { rateLimitWindows } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfter: number }

export async function checkRateLimit(
  scope: string,
  ip: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const key = `${scope}:${ip}`
  const existing = await db
    .select()
    .from(rateLimitWindows)
    .where(eq(rateLimitWindows.key, key))
    .limit(1)

  const now = new Date()

  if (existing.length === 0) {
    await db.insert(rateLimitWindows).values({ key, count: 1, windowStart: now })
    return { limited: false }
  }

  const row = existing[0]
  const windowExpired =
    now.getTime() - row.windowStart.getTime() > windowMs

  if (windowExpired) {
    await db
      .update(rateLimitWindows)
      .set({ count: 1, windowStart: now })
      .where(eq(rateLimitWindows.key, key))
    return { limited: false }
  }

  if (row.count >= limit) {
    const windowEnd = new Date(row.windowStart.getTime() + windowMs)
    const retryAfter = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000)
    return { limited: true, retryAfter }
  }

  await db
    .update(rateLimitWindows)
    .set({ count: sql`${rateLimitWindows.count} + 1` })
    .where(eq(rateLimitWindows.key, key))
  return { limited: false }
}
