import React from 'react'

type BtnVariant = 'primary' | 'dark' | 'ghost'
type BtnSize = 'sm' | 'md' | 'lg'

type BtnProps = {
  variant?: BtnVariant
  size?: BtnSize
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const VARIANT_CLASS: Record<BtnVariant, string> = {
  primary: 'btn-primary',
  dark: 'btn-dark',
  ghost: 'btn-ghost',
}

const SIZE_CLASS: Record<BtnSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export const Btn = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: BtnProps) => {
  const cls = ['btn', VARIANT_CLASS[variant], SIZE_CLASS[size], className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
