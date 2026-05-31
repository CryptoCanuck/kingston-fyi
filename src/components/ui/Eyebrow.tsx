import React from 'react'

type EyebrowProps = {
  as?: 'span' | 'div' | 'p'
  className?: string
  children: React.ReactNode
}

/* Uppercase amber kicker above headlines. 800 weight, .14em tracking. */
export const Eyebrow = ({ as: Tag = 'span', className, children }: EyebrowProps) => {
  const cls = ['eyebrow', className].filter(Boolean).join(' ')
  return <Tag className={cls}>{children}</Tag>
}
