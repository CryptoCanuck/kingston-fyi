import React from 'react'

type LogoProps = {
  light?: boolean
  size?: number
  href?: string
}

/* Wordmark only — "Kingston.FYI" set in the serif, ".FYI" in accent.
   Renders as a link when `href` is provided, otherwise inert text. RSC-safe. */
export const Logo = ({ light = false, size = 26, href }: LogoProps) => {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'baseline',
    fontFamily: 'var(--serif)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    fontSize: size,
    lineHeight: 1,
    color: light ? 'var(--paper)' : 'var(--slate-900)',
  }
  const inner = (
    <>
      <span>Kingston</span>
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>.FYI</span>
    </>
  )
  if (href) {
    return (
      <a href={href} aria-label="Kingston.FYI home" style={style}>
        {inner}
      </a>
    )
  }
  return (
    <span aria-label="Kingston.FYI" style={style}>
      {inner}
    </span>
  )
}
