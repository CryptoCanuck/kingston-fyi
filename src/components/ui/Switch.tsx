'use client'

import React from 'react'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  name?: string
  disabled?: boolean
}

/* Toggle switch (e.g. "Open now"). Accent track when on. */
export const Switch = ({ checked, onChange, label, name, disabled }: SwitchProps) => {
  return (
    <label className="kf-switch">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="kf-switch-track" aria-hidden="true" />
      {label != null ? <span>{label}</span> : null}
    </label>
  )
}
