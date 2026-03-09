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
  try {
    const data = await getRedis().get(key)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  } catch {
    return null
  }
}

export async function cacheSet(
  key: string,
  data: unknown,
  ttlSeconds = 300
): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(data), 'EX', ttlSeconds)
  } catch {
    // fail silently
  }
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const client = getRedis()
    const stream = client.scanStream({ match: pattern, count: 100 })
    const pipeline = client.pipeline()

    for await (const keys of stream) {
      for (const key of keys as string[]) {
        pipeline.del(key)
      }
    }

    await pipeline.exec()
  } catch {
    // fail silently
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
