import { NextRequest } from 'next/server'
import { type ZodSchema, ZodError } from 'zod'
import { error } from './response'

function formatZodError(e: ZodError): string {
  return e.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ')
}

export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw error('INVALID_JSON', 'Request body is not valid JSON', 400)
  }

  try {
    return schema.parse(body)
  } catch (e) {
    if (e instanceof ZodError) {
      throw error('VALIDATION_ERROR', formatZodError(e), 422)
    }
    throw error('VALIDATION_ERROR', 'Invalid request body', 422)
  }
}

export function validateParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries())

  try {
    return schema.parse(params)
  } catch (e) {
    if (e instanceof ZodError) {
      throw error('VALIDATION_ERROR', formatZodError(e), 422)
    }
    throw error('VALIDATION_ERROR', 'Invalid query parameters', 422)
  }
}
