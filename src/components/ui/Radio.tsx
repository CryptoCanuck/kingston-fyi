'use client'

import React from 'react'

type RadioProps = {
  checked: boolean
  onChange: (value: string) => void
  label?: React.ReactNode
  name: string
  value: string
  disabled?: boolean
}

/* Round radio (e.g. minimum-rating facet). Accent fill + dot when on. */
export const Radio = ({ checked, onChange, label, name, value, disabled }: RadioProps) => {
  return (
    <label className="kf-control">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className="kf-box kf-box-radio" aria-hidden="true" />
      {label != null ? <span>{label}</span> : null}
    </label>
  )
}
