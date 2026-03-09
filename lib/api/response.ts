import { NextResponse } from 'next/server'
import type { ApiResponse, PaginatedResponse, ApiError } from '../types'

export function success<T>(
  data: T,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) })
}

export function error(
  code: string,
  message: string,
  status: number
): NextResponse<ApiError> {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function paginated<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}
