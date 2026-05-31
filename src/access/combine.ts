import type { Access, Where } from 'payload'

/**
 * Compose multiple Access functions with logical AND. Payload honors a single access
 * result per operation; this lets a collection require several constraints at once
 * (e.g. `cityScoped()` AND `published()` on directory reads). Semantics:
 *
 *  - any function returning `false` → deny the whole operation (`false`)
 *  - `true` (or nullish) is the identity — it imposes no constraint
 *  - returned `Where` constraints are AND-combined into one filter
 *  - if every function returns `true`, the result is `true` (full access)
 *
 * Order is preserved; all functions are awaited (they may be async).
 */
export const andAccess = (...fns: Access[]): Access => {
  return async (args) => {
    const wheres: Where[] = []
    for (const fn of fns) {
      const result = await fn(args)
      if (result === false) return false
      if (result === true || result == null) continue
      wheres.push(result as Where)
    }
    if (wheres.length === 0) return true
    if (wheres.length === 1) return wheres[0]
    return { and: wheres }
  }
}
