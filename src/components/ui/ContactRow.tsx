import React from 'react'

import { Icon, type IconName } from './Icon'

type ContactRowProps = {
  icon: IconName
  href?: string
  external?: boolean
  children: React.ReactNode
}

/* Icon + value line for a business detail panel (phone, web, address…).
   Renders a link when `href` is provided. */
export const ContactRow = ({ icon, href, external, children }: ContactRowProps) => {
  return (
    <div className="kf-contact-row">
      <Icon name={icon} size={17} />
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      ) : (
        <span>{children}</span>
      )}
    </div>
  )
}
