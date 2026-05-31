import type { Access } from 'payload'

import type { User } from '../payload-types'
import { hasRole } from './isAdmin'

/** A claimant/owner who manages their listing(s) but has no admin-panel access. */
export const isBusinessOwnerUser = (user: User | null | undefined): boolean =>
  hasRole(user, ['business-owner'])

export const isBusinessOwner: Access = ({ req }) =>
  isBusinessOwnerUser(req.user as User | null | undefined)
