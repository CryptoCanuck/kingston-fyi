'use client'

import React, { useId, useState } from 'react'

import { Icon } from '@/components/ui'

type NewsletterBandProps = {
  /* compact = card variant (rounded, no full-bleed wrap) for reuse inside page columns */
  compact?: boolean
}

/* "The Limestone Letter" signup band. Presentational only — no backend yet (Story 7.1 wires
   Resend). The form is a labelled email input + submit; on submit it shows a confirmation and
   never throws or dead-ends. */
export const NewsletterBand = ({ compact = false }: NewsletterBandProps) => {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const inputId = useId()

  return (
    <section
      className={['kf-news-band', compact ? 'kf-news-band-compact' : ''].filter(Boolean).join(' ')}
      aria-label="Newsletter signup"
    >
      <div className={compact ? 'kf-news-band-inner' : 'kf-wrap kf-news-band-inner'}>
        <div className="kf-news-band-copy">
          <div className="eyebrow kf-news-band-eyebrow">The Limestone Letter</div>
          <h2 className="kf-news-band-title">Kingston, in your inbox every morning.</h2>
          <p className="kf-news-band-sub">
            The day&rsquo;s local news, tonight&rsquo;s events and a new business worth a visit —
            free, no fluff.
          </p>
        </div>
        {done ? (
          <p className="kf-news-band-done" role="status">
            <span className="kf-news-band-check" aria-hidden="true">
              <Icon name="check" size={18} />
            </span>
            You&rsquo;re on the list.
          </p>
        ) : (
          <form
            className="kf-news-band-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (email.trim()) setDone(true)
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <input
              id={inputId}
              className="input kf-news-band-input"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary btn-lg" type="submit">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
