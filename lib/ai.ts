import OpenAI from 'openai'

let fastClient: OpenAI | null = null
let batchClient: OpenAI | null = null
let embedClient: OpenAI | null = null

/** Real-time inference — 5090 GPU rig via LM Studio */
export function getFastClient(): OpenAI {
  if (!fastClient) {
    fastClient = new OpenAI({
      baseURL: process.env.LM_STUDIO_FAST_URL || 'http://localhost:1234/v1',
      apiKey: 'lm-studio',
    })
  }
  return fastClient
}

/** Batch inference — gmktec boxes via LM Studio */
export function getBatchClient(): OpenAI {
  if (!batchClient) {
    batchClient = new OpenAI({
      baseURL: process.env.LM_STUDIO_BATCH_URL || 'http://localhost:1234/v1',
      apiKey: 'lm-studio',
    })
  }
  return batchClient
}

/** Embedding generation — gmktec boxes via LM Studio */
export function getEmbedClient(): OpenAI {
  if (!embedClient) {
    embedClient = new OpenAI({
      baseURL: process.env.LM_STUDIO_EMBED_URL || 'http://localhost:1234/v1',
      apiKey: 'lm-studio',
    })
  }
  return embedClient
}

export async function moderateReview(text: string): Promise<{
  classification: 'clean' | 'spam' | 'offensive' | 'likely_fake'
  confidence: number
  reasoning: string
}> {
  const response = await getFastClient().chat.completions.create({
    model: 'llama-3.1-8b',
    messages: [
      {
        role: 'system',
        content: `You are a review moderation assistant. Classify the review as one of: clean, spam, offensive, likely_fake. Respond with JSON only: {"classification": "...", "confidence": 0.0-1.0, "reasoning": "..."}`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content)
}

export async function enrichListing(data: {
  name: string
  category: string
  address?: string
  existingDescription?: string
}): Promise<{
  description: string
  normalizedCategory: string
}> {
  const response = await getBatchClient().chat.completions.create({
    model: 'qwen2.5-14b',
    messages: [
      {
        role: 'system',
        content: `You are a local business listing writer. Given a business name, category, and address, generate a concise SEO-friendly description (2-3 sentences) and normalize the category to one of: restaurant, bar, nightclub, cafe, bakery, shopping, attraction, activity, service. Respond with JSON only: {"description": "...", "normalizedCategory": "..."}`,
      },
      {
        role: 'user',
        content: `Name: ${data.name}\nCategory: ${data.category}\nAddress: ${data.address || 'N/A'}\nExisting description: ${data.existingDescription || 'None'}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content)
}

export async function summarizeArticle(text: string): Promise<{
  summary: string
  categories: string[]
  entities: { businesses: string[]; locations: string[]; people: string[] }
}> {
  const response = await getBatchClient().chat.completions.create({
    model: 'qwen2.5-14b',
    messages: [
      {
        role: 'system',
        content: `You are a local news analyst. Given an article, produce: a 2-3 sentence summary, categories (from: business, politics, events, development, sports, community), and extracted entities (businesses, locations, people). Respond with JSON only: {"summary": "...", "categories": [...], "entities": {"businesses": [...], "locations": [...], "people": [...]}}`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content)
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getEmbedClient().embeddings.create({
    model: 'nomic-embed-text',
    input: text,
  })

  return response.data[0].embedding
}

export async function classifyCategory(text: string): Promise<string> {
  const response = await getBatchClient().chat.completions.create({
    model: 'llama-3.1-8b',
    messages: [
      {
        role: 'system',
        content: `Classify the following business into exactly one category: restaurant, bar, nightclub, cafe, bakery, shopping, attraction, activity, service. Respond with the category only, no other text.`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.1,
    max_tokens: 10,
  })

  return (response.choices[0]?.message?.content || 'service').trim().toLowerCase()
}
