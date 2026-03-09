import Redis from 'ioredis'

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })
  }
  return redis
}

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const data = await getRedis().get(key)
  if (!data) return null
  return JSON.parse(data) as T
}

export async function cacheSet(
  key: string,
  data: unknown,
  ttlSeconds = 300
): Promise<void> {
  await getRedis().set(key, JSON.stringify(data), 'EX', ttlSeconds)
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  const client = getRedis()
  const keys = await client.keys(pattern)
  if (keys.length > 0) {
    await client.del(...keys)
  }
}

// City-prefixed key helpers
// Pattern: fyi:{city}:{entity}:{identifier}
export function cityKey(
  city: string,
  entity: string,
  identifier: string
): string {
  return `fyi:${city}:${entity}:${identifier}`
}

export { getRedis }
