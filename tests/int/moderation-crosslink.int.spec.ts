import { describe, it, expect, vi } from 'vitest'

import { published } from '@/access/published'
import { statusField, MODERATION_STATUSES, PUBLIC_STATUSES } from '@/fields/statusField'
import { entityTag, listTag, crossTag } from '@/lib/cache'
import { reModerateOnEdit } from '@/hooks/moderationState'
import { getReverseLinks } from '@/lib/crossLinks'
import type { User } from '@/payload-types'

const anon = { req: { user: null } } as never
const adminReq = { req: { user: { id: 'a', roles: ['admin'] } as User } } as never

describe('Moderation gate & cross-links (Story 1.5)', () => {
  describe('published() access', () => {
    it('non-staff see only approved/published', () => {
      expect(published()(anon)).toEqual({ status: { in: ['approved', 'published'] } })
    })
    it('admins bypass the gate (see drafts/pending)', () => {
      expect(published()(adminReq)).toBe(true)
    })
  })

  describe('statusField', () => {
    it('defaults to draft and never auto-publishes', () => {
      const f = statusField() as { defaultValue?: unknown }
      expect(f.defaultValue).toBe('draft')
    })
    it('exposes the full lifecycle and the public subset', () => {
      expect(MODERATION_STATUSES).toEqual(['draft', 'pending', 'approved', 'published'])
      expect(PUBLIC_STATUSES).toEqual(['approved', 'published'])
    })
  })

  describe('cache tag conventions', () => {
    it('builds entity/list/cross tags', () => {
      expect(entityTag('x')).toBe('entity:x')
      expect(listTag('c1', 'news')).toBe('list:c1:news')
      expect(crossTag('x')).toBe('cross:x')
    })
  })

  describe('reModerateOnEdit() (FR59 scaffold)', () => {
    const hook = reModerateOnEdit()
    const run = (args: Record<string, unknown>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hook as any)(args)

    it('sends a published doc back to pending when a non-staff user edits it', () => {
      const out = run({
        data: { title: 'new' },
        originalDoc: { status: 'published' },
        operation: 'update',
        req: { user: null },
      })
      expect(out.status).toBe('pending')
    })
    it('leaves staff edits untouched', () => {
      const out = run({
        data: { title: 'new', status: 'published' },
        originalDoc: { status: 'published' },
        operation: 'update',
        req: { user: { id: 'op' } },
      })
      expect(out.status).toBe('published')
    })
    it('does not touch create operations', () => {
      const out = run({ data: { status: 'draft' }, operation: 'create', req: { user: null } })
      expect(out.status).toBe('draft')
    })
  })

  describe('getReverseLinks() — derived, never stored (FR55)', () => {
    it('queries the source collection by the via-field + city, returns matches', async () => {
      const find = vi.fn().mockResolvedValue({ docs: [{ id: '1' }, { id: '2' }] })
      const payload = { find } as never
      const result = await getReverseLinks({
        payload,
        fromCollection: 'businesses' as never,
        viaField: 'relatedBusinesses',
        targetId: 'abc',
        cityId: 'c1',
      })
      expect(result).toHaveLength(2)
      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'businesses',
          where: { and: [{ relatedBusinesses: { equals: 'abc' } }, { city: { equals: 'c1' } }] },
        }),
      )
    })
  })
})
