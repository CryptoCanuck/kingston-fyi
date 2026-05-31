'use client'

import React, { useState } from 'react'

import { Icon } from '@/components/ui'

/**
 * Share affordance for the detail header. Uses the Web Share API when available (mobile) and
 * falls back to copying the URL to the clipboard with brief "Copied!" feedback.
 */
export const ShareButton = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={onShare}>
      <Icon name={copied ? 'check' : 'share'} size={16} /> {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
