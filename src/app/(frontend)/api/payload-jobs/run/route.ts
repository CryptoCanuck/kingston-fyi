import config from '@payload-config'
import { getPayload } from 'payload'

// Cron trigger for the Jobs Queue (AR20). Railway (or any external) cron hits this GET
// endpoint to run queued jobs on demand. Guarded by CRON_SECRET, supplied either as a
// Bearer token (`Authorization: Bearer <secret>`) or `?secret=<secret>`. On success it
// runs with overrideAccess (the secret IS the authorization), so no admin session needed.
//
// GET (not POST) so platform cron schedulers that only issue GETs can call it.

export const GET = async (req: Request): Promise<Response> => {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return Response.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 503 },
    )
  }

  const url = new URL(req.url)
  const auth = req.headers.get('authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : undefined
  const provided = bearer ?? url.searchParams.get('secret') ?? undefined

  if (provided !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await payload.jobs.run({ allQueues: true })

  return Response.json({ ok: true, result })
}
