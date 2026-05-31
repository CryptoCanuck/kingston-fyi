// Provider-agnostic inference contract (AR23). Pipelines depend ONLY on these types,
// never on a concrete provider. Swapping the model host (vLLM / Ollama / hosted) means
// swapping the implementation behind getInferenceClient() — pipeline code is untouched.

export type InferenceRole = 'system' | 'user' | 'assistant'

export type InferenceMessage = {
  role: InferenceRole
  content: string
}

export type InferenceCompleteOptions = {
  /** Sampling temperature (0 = deterministic). */
  temperature?: number
  /** Hard cap on generated tokens. */
  maxTokens?: number
  /** Override the configured model for a single call. */
  model?: string
  /** Abort signal for cancellation / timeouts. */
  signal?: AbortSignal
}

export type InferenceResult = {
  /** The generated assistant text. */
  text: string
  /** The model that produced the result (echoed from the provider when available). */
  model: string
}

/**
 * The single interface every pipeline calls. `complete` accepts either a raw prompt
 * string (sugar for a single user message) or an explicit message list.
 */
export type InferenceClient = {
  /** True when the client is backed by a configured endpoint. */
  readonly configured: boolean
  complete: (
    input: string | InferenceMessage[],
    opts?: InferenceCompleteOptions,
  ) => Promise<InferenceResult>
}

/** Raised when an inference call is attempted without a configured endpoint. */
export class InferenceNotConfiguredError extends Error {
  constructor(message = 'Inference client is not configured: set INFERENCE_BASE_URL.') {
    super(message)
    this.name = 'InferenceNotConfiguredError'
  }
}

/** Raised when the inference endpoint returns a non-OK response or malformed body. */
export class InferenceRequestError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'InferenceRequestError'
    this.status = status
  }
}
