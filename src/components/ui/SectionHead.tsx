import React from 'react'

import { Icon } from './Icon'

type SectionHeadProps = {
  title: React.ReactNode
  moreLabel?: string
  moreHref?: string
  className?: string
}

/* Titled section header with slate underline and an optional "more" link. */
export const SectionHead = ({ title, moreLabel, moreHref, className }: SectionHeadProps) => {
  const cls = ['section-head', className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <h2>{title}</h2>
      {moreLabel ? (
        <a className="more" href={moreHref}>
          {moreLabel}
          <Icon name="arrowR" size={15} />
        </a>
      ) : null}
    </div>
  )
}
