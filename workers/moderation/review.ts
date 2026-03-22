import { Worker } from 'bullmq'
import { connection } from '../connection'
import { QUEUE_NAMES } from '../queues'
import { moderateReview } from '../../lib/ai'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://supabase-kong:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function supabaseRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=representation',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase ${path}: ${response.status} ${text}`)
  }
  return response.json()
}

export interface ModerationJobData {
  type: 'review'
  entityId: string
  content: string
}

export const reviewModerationWorker = new Worker(
  QUEUE_NAMES.MODERATION,
  async (job) => {
    const { type, entityId, content } = job.data as ModerationJobData

    if (type !== 'review') {
      console.log(`[Moderation] Unknown type: ${type}`)
      return
    }

    console.log(`[Moderation] Processing review ${entityId}...`)

    let classification: 'clean' | 'spam' | 'offensive' | 'likely_fake' = 'clean'
    let confidence = 1.0
    let reasoning = 'AI moderation unavailable, auto-approved'
    let sentimentScore: number | null = null

    try {
      const result = await moderateReview(content)
      classification = result.classification
      confidence = result.confidence
      reasoning = result.reasoning
    } catch (err) {
      console.warn(`[Moderation] AI moderation failed for ${entityId}, auto-approving:`, err)
    }

    // Map classification to moderation status
    let moderationStatus: string
    switch (classification) {
      case 'clean':
        moderationStatus = 'approved'
        break
      case 'spam':
      case 'offensive':
      case 'likely_fake':
        moderationStatus = confidence > 0.8 ? 'rejected' : 'flagged'
        break
      default:
        moderationStatus = 'flagged'
    }

    // Attempt basic sentiment scoring (positive = 1, negative = 0, neutral = 0.5)
    try {
      const lowerContent = content.toLowerCase()
      const positiveWords = ['great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic', 'best', 'recommend']
      const negativeWords = ['terrible', 'awful', 'worst', 'hate', 'horrible', 'disgusting', 'avoid', 'never']

      const posCount = positiveWords.filter(w => lowerContent.includes(w)).length
      const negCount = negativeWords.filter(w => lowerContent.includes(w)).length
      const total = posCount + negCount

      if (total > 0) {
        sentimentScore = posCount / total
      } else {
        sentimentScore = 0.5
      }
    } catch {
      sentimentScore = 0.5
    }

    // Update review in database
    await supabaseRequest(`/reviews?id=eq.${entityId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        moderation_status: moderationStatus,
        sentiment_score: sentimentScore,
        moderation_metadata: {
          classification,
          confidence,
          reasoning,
          moderated_at: new Date().toISOString(),
          model: 'llama-3.1-8b',
        },
      }),
    })

    console.log(`[Moderation] Review ${entityId}: ${classification} → ${moderationStatus} (${confidence})`)

    return { entityId, classification, moderationStatus, confidence }
  },
  { connection, concurrency: 2 }
)
