import React from 'react'

let fieldSeq = 0
const nextId = (prefix: string) => `${prefix}-${++fieldSeq}`

type FieldWrapProps = {
  label?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

/* Labelled field column (label above control). */
export const Field = ({ label, htmlFor, className, children }: FieldWrapProps) => {
  const cls = ['field', className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      {label ? <label htmlFor={htmlFor}>{label}</label> : null}
      {children}
    </div>
  )
}

type TextInputProps = {
  label?: string
  id?: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const TextInput = ({ label, id, className, ...rest }: TextInputProps) => {
  const inputId = id ?? nextId('input')
  const input = (
    <input id={inputId} className={['input', className].filter(Boolean).join(' ')} {...rest} />
  )
  if (!label) return input
  return (
    <Field label={label} htmlFor={inputId}>
      {input}
    </Field>
  )
}

type TextAreaProps = {
  label?: string
  id?: string
  className?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextArea = ({ label, id, className, ...rest }: TextAreaProps) => {
  const inputId = id ?? nextId('textarea')
  const el = (
    <textarea
      id={inputId}
      className={['textarea', className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
  if (!label) return el
  return (
    <Field label={label} htmlFor={inputId}>
      {el}
    </Field>
  )
}

type SelectProps = {
  label?: string
  id?: string
  className?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = ({ label, id, className, children, ...rest }: SelectProps) => {
  const inputId = id ?? nextId('select')
  const el = (
    <select id={inputId} className={['select', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </select>
  )
  if (!label) return el
  return (
    <Field label={label} htmlFor={inputId}>
      {el}
    </Field>
  )
}
