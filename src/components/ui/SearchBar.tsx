'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Icon, type IconName } from './Icon'

export type Suggestion = {
  label: string
  kind?: string
  icon?: IconName
}

type SearchBarProps = {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  suggestions?: Suggestion[]
  compact?: boolean
  onPick?: (suggestion: Suggestion) => void
}

/* Unified search across News + Events + Businesses with inline autocomplete.
   Adapted verbatim from the locked prototype. */
export const SearchBar = ({
  placeholder = 'Search news, events & businesses',
  value,
  onChange,
  onSubmit,
  suggestions,
  compact,
  onPick,
}: SearchBarProps) => {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState(value || '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const q = value != null ? value : local
  const setQ = (v: string) => {
    if (onChange) onChange(v)
    else setLocal(v)
  }

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const matches =
    suggestions && q.trim()
      ? suggestions.filter((s) => s.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
      : []

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (onSubmit) onSubmit(q)
          setOpen(false)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--card)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--r-pill)',
          padding: compact ? '7px 14px' : '9px 16px',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={() => setOpen(true)}
      >
        <Icon name="search" size={compact ? 16 : 18} style={{ color: 'var(--ink-faint)' }} />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          placeholder={placeholder}
          style={{
            border: 0,
            outline: 'none',
            background: 'none',
            flex: 1,
            minWidth: 0,
            fontFamily: 'var(--sans)',
            fontSize: compact ? '14.5px' : '15.5px',
            color: 'var(--ink)',
          }}
        />
      </form>
      {open && matches.length > 0 ? (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 60,
            boxShadow: 'var(--shadow-lg)',
            padding: 6,
            borderRadius: 'var(--r)',
          }}
        >
          {matches.map((m, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                if (onPick) onPick(m)
                else if (onSubmit) onSubmit(m.label)
                setOpen(false)
                setQ(m.label)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                background: 'none',
                border: 0,
                padding: '9px 11px',
                borderRadius: 'var(--r-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--limestone)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Icon name={m.icon || 'search'} size={15} style={{ color: 'var(--ink-faint)' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>{m.label}</span>
              {m.kind ? (
                <span
                  className="faint"
                  style={{
                    marginLeft: 'auto',
                    fontSize: 12.5,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    fontWeight: 700,
                  }}
                >
                  {m.kind}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
