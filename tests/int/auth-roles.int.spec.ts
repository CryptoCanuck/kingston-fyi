import { describe, it, expect } from 'vitest'

import type { User } from '@/payload-types'
import { isAdminUser } from '@/access/isAdmin'
import { isBusinessOwnerUser } from '@/access/isBusinessOwner'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { Users } from '@/collections/Users'

const user = (roles: User['roles'], id = 'u1'): User =>
  ({ id, email: 'x@y.z', roles, createdAt: '', updatedAt: '' }) as User

const reqOf = (u: User | null) => ({ req: { user: u } }) as never

describe('Auth & RBAC (Story 1.3)', () => {
  describe('isAdminUser', () => {
    it('is true for admin and operator', () => {
      expect(isAdminUser(user(['admin']))).toBe(true)
      expect(isAdminUser(user(['operator']))).toBe(true)
    })
    it('is false for business-owner and anonymous', () => {
      expect(isAdminUser(user(['business-owner']))).toBe(false)
      expect(isAdminUser(null)).toBe(false)
    })
  })

  describe('isBusinessOwnerUser', () => {
    it('is true only for business-owner', () => {
      expect(isBusinessOwnerUser(user(['business-owner']))).toBe(true)
      expect(isBusinessOwnerUser(user(['admin']))).toBe(false)
      expect(isBusinessOwnerUser(null)).toBe(false)
    })
  })

  describe('admin-panel gating (Users.access.admin)', () => {
    const canAccessAdmin = (u: User | null) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Users.access as any).admin({ req: { user: u } })

    it('admins/operators reach the panel; owners cannot', () => {
      expect(canAccessAdmin(user(['admin']))).toBe(true)
      expect(canAccessAdmin(user(['operator']))).toBe(true)
      expect(canAccessAdmin(user(['business-owner']))).toBe(false)
      expect(canAccessAdmin(null)).toBe(false)
    })
  })

  describe('isAdminOrSelf', () => {
    it('admins read all; a user is scoped to their own record; anon denied', () => {
      expect(isAdminOrSelf(reqOf(user(['admin'])))).toBe(true)
      expect(isAdminOrSelf(reqOf(user(['business-owner'], 'me')))).toEqual({
        id: { equals: 'me' },
      })
      expect(isAdminOrSelf(reqOf(null))).toBe(false)
    })
  })
})
