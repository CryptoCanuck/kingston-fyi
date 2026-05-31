import React from 'react'

type TagProps = {
  color?: string
  small?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/* Solid editorial category tag. `color` accepts any CSS color or a token
   like `var(--tag-local)`; defaults to slate. */
export const Tag = ({ color, small, className, style, children }: TagProps) => {
  const cls = ['tag', className].filter(Boolean).join(' ')
  return (
    <span
      className={cls}
      style={{
        background: color || 'var(--slate-700)',
        fontSize: small ? '10.5px' : undefined,
        padding: small ? '3px 7px' : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

type TagOutlineProps = {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/* Subtle outlined tag — sentence-case, no fill. */
export const TagOutline = ({ className, style, children }: TagOutlineProps) => {
  const cls = ['tag', 'tag-outline', className].filter(Boolean).join(' ')
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  )
}
