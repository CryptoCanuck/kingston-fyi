import type { Access, FieldAccess } from 'payload'

import type { User } from '../payload-types'

export type Role = 'admin' | 'operator' | 'business-owner'

const getRoles = (user: User | null | undefined): Role[] =>
  user && Array.isArray(user.roles) ? (user.roles as Role[]) : []

export const hasRole = (user: User | null | undefined, roles: Role[]): boolean =>
  getRoles(user).some((r) => roles.includes(r))

/** admin/operator — the CMS staff who can enter the admin panel and moderate. */
export const isAdminUser = (user: User | null | undefined): boolean =>
  hasRole(user, ['admin', 'operator'])

export const isAdmin: Access = ({ req }) => isAdminUser(req.user as User | null | undefined)

export const isAdminFieldLevel: FieldAccess = ({ req }) =>
  isAdminUser(req.user as User | null | undefined)
