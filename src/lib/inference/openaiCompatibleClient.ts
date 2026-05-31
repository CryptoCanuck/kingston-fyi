import type {
  InferenceClient,
  InferenceCompleteOptions,
  InferenceMessage,
  InferenceResult,
} from './types'
import { InferenceNotConfiguredError, InferenceRequestError } from './types'

export type OpenAICompatibleClientConfig = {
  /** Base URL of the OpenAI-compatible endpoint (e.g. http://host:8000/v1). */
  baseURL?: string
  /** Optional bearer token. Many self-hosted endpoints (Ollama/vLLM) need none. */
  apiKey?: string
  /** Default model identifier. */
  model?: string
  /** Injectable fetch — defaults to global fetch; overridden in tests. */
  fetchImpl?: typeof fetch
}

const toMessages = (input: string | InferenceMessage[]): InferenceMessage[] =>
  typeof input === 'string' ? [{ role: 'user', content: input }] : input

/**
 * Default inference implementation (AR23): targets a self-hosted, open-weights model via
 * an OpenAI-compatible `POST {baseURL}/chat/completions`. Provider-agnostic — any endpoint
 * speaking that shape works (vLLM, Ollama, llama.cpp server, TGI-compat, hosted gateways).
 * No provider-specific code leaks to callers.
 */
export class OpenAICompatibleClient implements InferenceClient {
  private readonly baseURL: string
  private readonly apiKey?: string
  private readonly model: string
  private readonly fetchImpl: typeof fetch

  constructor(config: OpenAICompatibleClientConfig = {}) {
    this.baseURL = (config.baseURL ?? '').replace(/\/+$/, '')
    this.apiKey = config.apiKey
    this.model = config.model ?? 'default'
    this.fetchImpl = config.fetchImpl ?? fetch
  }

  get configured(): boolean {
    return this.baseURL.length > 0
  }

  async complete(
    input: string | InferenceMessage[],
    opts: InferenceCompleteOptions = {},
  ): Promise<InferenceResult> {
    if (!this.configured) throw new InferenceNotConfiguredError()

    const model = opts.model ?? this.model
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`

    let res: Response
    try {
      res = await this.fetchImpl(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        signal: opts.signal,
        body: JSON.stringify({
          model,
          messages: toMessages(input),
          temperature: opts.temperature ?? 0,
          max_tokens: opts.maxTokens,
        }),
      })
    } catch (err) {
      throw new InferenceRequestError(
        `Inference request failed: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new InferenceRequestError(
        `Inference endpoint returned ${res.status}${detail ? `: ${detail}` : ''}`,
        res.status,
      )
    }

    const body = (await res.json().catch(() => null)) as {
      model?: string
      choices?: { message?: { content?: string } }[]
    } | null

    const text = body?.choices?.[0]?.message?.content
    if (typeof text !== 'string') {
      throw new InferenceRequestError('Inference response missing choices[0].message.content')
    }

    return { text, model: body?.model ?? model }
  }
}
