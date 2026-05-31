import type { Access, FieldAccess } from 'payload'

// Admin/operator access. Story 1.2 uses authenticated-user as the gate; Story 1.3
// refines this to role-based (`admin`/`operator`) once the Users.roles field exists.
export const isAdmin: Access = ({ req }) => Boolean(req.user)

export const isAdminField: FieldAccess = ({ req }) => Boolean(req.user)
