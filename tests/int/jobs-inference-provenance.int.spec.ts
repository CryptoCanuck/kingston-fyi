import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  getInferenceClient,
  resetInferenceClient,
  OpenAICompatibleClient,
  InferenceNotConfiguredError,
  InferenceRequestError,
} from '@/lib/inference'
import {
  provenanceField,
  PROVENANCE_SOURCES,
  OWNER_OWNED_SOURCES,
} from '@/fields/provenance'
import {
  ingestDraftDefaults,
  INGEST_DEFAULT_STATUS,
} from '@/jobs/draftDefaults'
import { heartbeatTask } from '@/jobs/heartbeat'
import { PUBLIC_STATUSES } from '@/fields/statusField'

describe('Provenance field factory (AR18, FR56)', () => {
  it('returns a sidebar group with the four source values', () => {
    const field = provenanceField()
    expect(field.type).toBe('group')
    expect((field as { name: string }).name).toBe('provenance')

    const fields = (field as { fields: { name: string; type: string }[] }).fields
    const source = fields.find((f) => f.name === 'source') as
      | { options: { value: string }[]; defaultValue: string }
      | undefined
    expect(source).toBeDefined()
    expect(source?.options.map((o) => o.value)).toEqual([
      'seeded',
      'google-places',
      'owner-edited',
      'operator',
    ])
    expect(source?.defaultValue).toBe('seeded')
  })

  it('exposes lockedFields, refreshRequired and a refresh timestamp', () => {
    const fields = (provenanceField() as { fields: { name: string; type: string }[] }).fields
    const names = fields.map((f) => f.name)
    expect(names).toContain('lockedFields')
    expect(names).toContain('refreshRequired')
    expect(names).toContain('lastRefreshedAt')
    expect(fields.find((f) => f.name === 'lockedFields')?.type).toBe('text')
  })

  it('exports exactly the four provenance sources and owner-owned subset', () => {
    expect(PROVENANCE_SOURCES).toHaveLength(4)
    expect(PROVENANCE_SOURCES).toEqual(['seeded', 'google-places', 'owner-edited', 'operator'])
    expect(OWNER_OWNED_SOURCES).toEqual(['owner-edited', 'operator'])
  })

  it('honours a custom default source and name', () => {
    const field = provenanceField({ defaultSource: 'operator', name: 'origin' })
    expect((field as { name: string }).name).toBe('origin')
    const source = (field as { fields: { name: string; defaultValue?: string }[] }).fields.find(
      (f) => f.name === 'source',
    )
    expect(source?.defaultValue).toBe('operator')
  })
})

describe('Inference client factory (AR23)', () => {
  beforeEach(() => {
    resetInferenceClient()
    delete process.env.INFERENCE_BASE_URL
    delete process.env.INFERENCE_API_KEY
    delete process.env.INFERENCE_MODEL
  })

  it('returns a client implementing the InferenceClient interface', () => {
    const client = getInferenceClient()
    expect(typeof client.complete).toBe('function')
    expect(typeof client.configured).toBe('boolean')
  })

  it('reports not configured and throws descriptively when unconfigured', async () => {
    const client = getInferenceClient()
    expect(client.configured).toBe(false)
    await expect(client.complete('hello')).rejects.toBeInstanceOf(InferenceNotConfiguredError)
  })

  it('does not crash on import / construction without env', () => {
    expect(() => getInferenceClient()).not.toThrow()
  })

  it('performs an OpenAI-compatible completion against the configured endpoint', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: 'test-model',
          choices: [{ message: { content: 'Hi from the model' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const client = new OpenAICompatibleClient({
      baseURL: 'http://inference.local/v1/',
      apiKey: 'secret-key',
      model: 'test-model',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(client.configured).toBe(true)
    const result = await client.complete('hello', { temperature: 0.2, maxTokens: 64 })

    expect(result).toEqual({ text: 'Hi from the model', model: 'test-model' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [calledUrl, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    // Trailing slash normalised, OpenAI-compatible path used.
    expect(calledUrl).toBe('http://inference.local/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-key')
    const sent = JSON.parse(init.body as string)
    expect(sent.messages).toEqual([{ role: 'user', content: 'hello' }])
    expect(sent.temperature).toBe(0.2)
    expect(sent.max_tokens).toBe(64)
  })

  it('errors clearly on a non-OK endpoint response', async () => {
    const fetchImpl = vi.fn(async () => new Response('boom', { status: 500 }))
    const client = new OpenAICompatibleClient({
      baseURL: 'http://inference.local',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await expect(client.complete('hello')).rejects.toBeInstanceOf(InferenceRequestError)
  })

  it('passes an explicit message list through unchanged', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
        status: 200,
      }),
    )
    const client = new OpenAICompatibleClient({
      baseURL: 'http://inference.local',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await client.complete([
      { role: 'system', content: 'You are terse.' },
      { role: 'user', content: 'hi' },
    ])
    const sent = JSON.parse(
      (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
    )
    expect(sent.messages).toHaveLength(2)
    expect(sent.messages[0].role).toBe('system')
  })
})

describe('Moderation invariant for jobs (NFR4)', () => {
  it('ingest default status is never public', () => {
    expect(INGEST_DEFAULT_STATUS).toBe('draft')
    expect(PUBLIC_STATUSES).not.toContain(INGEST_DEFAULT_STATUS)
  })

  it('ingestDraftDefaults forces a non-public status, ignoring caller-supplied status', () => {
    const out = ingestDraftDefaults({
      title: 'Auto-summarized press release',
      status: 'published',
    } as Record<string, unknown>)
    expect(out.status).toBe('draft')
    expect(PUBLIC_STATUSES).not.toContain(out.status)
    expect(out.title).toBe('Auto-summarized press release')
  })

  it('allows routing to the pending moderation queue but never to public', () => {
    const out = ingestDraftDefaults({ title: 'x' }, 'pending')
    expect(out.status).toBe('pending')
    expect(PUBLIC_STATUSES).not.toContain(out.status)
  })

  it('the heartbeat task surfaces the non-public ingest default', async () => {
    const logged: string[] = []
    const req = {
      payload: { logger: { info: (m: string) => logged.push(m) } },
    } as never
    const handler = heartbeatTask.handler as (args: never) => Promise<unknown>
    const res = await handler({ req } as never)
    expect((res as { output: { ingestStatus: string } }).output.ingestStatus).toBe('draft')
    expect(PUBLIC_STATUSES).not.toContain('draft')
    expect(logged[0]).toContain('heartbeat ok')
  })
})
