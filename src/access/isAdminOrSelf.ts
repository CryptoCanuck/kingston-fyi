import type { Access } from 'payload'

import type { User } from '../payload-types'
import { isAdminUser } from './isAdmin'

/** Admins see all users; an authenticated user can read/update only their own record. */
export const isAdminOrSelf: Access = ({ req }) => {
  const user = req.user as User | null | undefined
  if (isAdminUser(user)) return true
  if (user) return { id: { equals: user.id } }
  return false
}
