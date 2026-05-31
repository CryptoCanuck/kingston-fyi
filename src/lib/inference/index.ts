import { OpenAICompatibleClient } from './openaiCompatibleClient'
import type { InferenceClient } from './types'

export type {
  InferenceClient,
  InferenceCompleteOptions,
  InferenceMessage,
  InferenceResult,
  InferenceRole,
} from './types'
export { InferenceNotConfiguredError, InferenceRequestError } from './types'
export { OpenAICompatibleClient } from './openaiCompatibleClient'

let cached: InferenceClient | undefined

/**
 * Single factory every pipeline uses to obtain an inference client (AR23). Reads the
 * environment contract (INFERENCE_BASE_URL / INFERENCE_API_KEY / INFERENCE_MODEL) and
 * returns the swappable default implementation. Never throws on import or when
 * unconfigured — an unconfigured client reports `configured === false` and only throws
 * (descriptively) if a pipeline actually calls `.complete()`.
 *
 * To swap providers, change ONLY this factory; callers keep using the InferenceClient
 * interface unchanged.
 */
export const getInferenceClient = (): InferenceClient => {
  if (cached) return cached
  cached = new OpenAICompatibleClient({
    baseURL: process.env.INFERENCE_BASE_URL,
    apiKey: process.env.INFERENCE_API_KEY,
    model: process.env.INFERENCE_MODEL,
  })
  return cached
}

/** Test/escape hatch to reset the memoized client (e.g. after changing env). */
export const resetInferenceClient = (): void => {
  cached = undefined
}
