import React from 'react'

import { Icon, type IconName } from './Icon'

type PhHue = 'ph-a' | 'ph-b' | 'ph-c' | 'ph-d' | 'ph-e' | 'ph-f'

type PhProps = {
  hue?: PhHue
  label?: string
  /* width / height aspect ratio, e.g. 16/9. When set the box is responsive. */
  ratio?: number
  height?: number | string
  icon?: IconName
  rounded?: boolean
  style?: React.CSSProperties
  children?: React.ReactNode
}

/* Styled image placeholder with limestone texture and hue variants. */
export const Ph = ({
  hue = 'ph-a',
  label,
  ratio,
  height,
  icon,
  rounded,
  style,
  children,
}: PhProps) => {
  const padTop = ratio ? `${(1 / ratio) * 100}%` : undefined
  return (
    <div
      className={`ph ${hue}`}
      style={{
        width: '100%',
        height: ratio ? 0 : height,
        paddingTop: padTop,
        borderRadius: rounded ? 'var(--r)' : 0,
        ...style,
      }}
    >
      <div
        style={{
          position: ratio ? 'absolute' : 'static',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {icon ? <Icon name={icon} size={26} stroke={1.6} style={{ opacity: 0.7 }} /> : null}
        {label ? <span className="ph-label">{label}</span> : null}
        {children}
      </div>
    </div>
  )
}
