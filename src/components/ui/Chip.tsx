'use client'

import React from 'react'

import { Icon } from './Icon'

type ChipProps = {
  active?: boolean
  onRemove?: () => void
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

/* Filter pill. `active` toggles the slate fill; `onRemove` adds a clear "x". */
export const Chip = ({
  active,
  onRemove,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) => {
  const cls = ['chip', active ? 'is-active' : '', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} {...rest}>
      {children}
      {onRemove ? (
        <span
          className="chip-x"
          role="button"
          aria-label="Remove filter"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          style={{ display: 'inline-flex' }}
        >
          <Icon name="close" size={13} stroke={2.4} />
        </span>
      ) : null}
    </button>
  )
}
