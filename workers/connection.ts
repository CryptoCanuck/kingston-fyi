import { ConnectionOptions } from 'bullmq'

function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url)
  return {
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port || '6379', 10),
    password: parsed.password || undefined,
  }
}

export const connection: ConnectionOptions = parseRedisUrl(
  process.env.REDIS_URL || 'redis://localhost:6379'
)
