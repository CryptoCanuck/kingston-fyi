import React from 'react'

import { Icon, type IconName } from './Icon'

type MetaProps = {
  icon?: IconName
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/* Faint icon + text row (date, location, time, etc.). */
export const Meta = ({ icon, className, style, children }: MetaProps) => {
  const cls = ['meta', className].filter(Boolean).join(' ')
  return (
    <span className={cls} style={style}>
      {icon ? <Icon name={icon} size={14} /> : null}
      <span>{children}</span>
    </span>
  )
}

/* Faint middot separator for inline meta sequences. */
export const DotSep = () => <span className="dot-sep">·</span>
