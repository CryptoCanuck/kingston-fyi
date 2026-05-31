import React from 'react'

import { Tag } from './Tag'

/* Maps the editorial category keys to their locked token colors. */
const CAT_COLOR: Record<string, string> = {
  local: 'var(--tag-local)',
  politics: 'var(--tag-politics)',
  business: 'var(--tag-business)',
  sports: 'var(--tag-sports)',
  arts: 'var(--tag-arts)',
  opinion: 'var(--tag-opinion)',
}

type CatTagProps = {
  catKey?: string
  label: string
  color?: string
  small?: boolean
}

/* Category tag for news / events. Resolves a known category key to its
   editorial color, or accepts an explicit `color`. Prop-driven (no globals). */
export const CatTag = ({ catKey, label, color, small }: CatTagProps) => {
  const resolved = color || (catKey ? CAT_COLOR[catKey] : undefined)
  return (
    <Tag color={resolved} small={small}>
      {label}
    </Tag>
  )
}
