'use client'

import React from 'react'

import { Icon } from './Icon'

type CheckProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  name?: string
  value?: string
  disabled?: boolean
}

/* Square checkbox (category facets). Accent fill + check glyph when on. */
export const Check = ({ checked, onChange, label, name, value, disabled }: CheckProps) => {
  return (
    <label className="kf-control">
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="kf-box kf-box-check" aria-hidden="true">
        <Icon name="check" size={13} stroke={3} />
      </span>
      {label != null ? <span>{label}</span> : null}
    </label>
  )
}
