import React from 'react'

type FilterGroupProps = {
  label: string
  className?: string
  children: React.ReactNode
}

/* Labelled group of filter controls in the directory sidebar. Presentational
   wrapper — pass Check / Radio / Switch / Chip rows as children. */
export const FilterGroup = ({ label, className, children }: FilterGroupProps) => {
  const cls = ['kf-filter-group', className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <span className="kf-flabel">{label}</span>
      <div className="kf-filter-group-body">{children}</div>
    </div>
  )
}
