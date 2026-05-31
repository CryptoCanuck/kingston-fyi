import React from 'react'

import { Stars } from './Stars'

type ReviewLineProps = {
  author: string
  rating: number
  date?: string
  children: React.ReactNode
}

/* A single review entry: author + stars header, then the review body. */
export const ReviewLine = ({ author, rating, date, children }: ReviewLineProps) => {
  return (
    <div className="kf-review">
      <div className="kf-review-head">
        <span className="kf-review-author">{author}</span>
        <Stars value={rating} showNum={false} />
      </div>
      {date ? (
        <span className="faint" style={{ fontSize: 12.5 }}>
          {date}
        </span>
      ) : null}
      <p className="kf-review-body">{children}</p>
    </div>
  )
}
