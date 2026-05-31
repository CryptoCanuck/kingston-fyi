import React from 'react'

/** Detail-page section heading: serif h2 with the slate underline rule (UX-DR12). */
export const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section style={{ marginBottom: 38 }}>
    <h2
      style={{
        fontSize: 24,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '2px solid var(--slate-800)',
      }}
    >
      {title}
    </h2>
    {children}
  </section>
)
