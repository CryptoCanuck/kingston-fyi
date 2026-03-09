import { headers } from 'next/headers'

const CITY_CONFIG = {
  kingston: {
    name: 'Kingston',
    tagline: 'Your Kingston Community Directory',
    color: '#1e40af', // Blue
  },
  ottawa: {
    name: 'Ottawa',
    tagline: 'Your Ottawa Community Directory',
    color: '#dc2626', // Red
  },
  montreal: {
    name: 'Montreal',
    tagline: 'Your Montreal Community Directory',
    color: '#7c3aed', // Purple
  },
} as const

type City = keyof typeof CITY_CONFIG

export default function HomePage() {
  const headersList = headers()
  const city = (headersList.get('x-city') || 'kingston') as City
  const config = CITY_CONFIG[city] || CITY_CONFIG.kingston

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: config.color,
          }}
        >
          {config.name}.FYI
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '2rem',
          }}
        >
          {config.tagline}
        </p>
        <div
          style={{
            background: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            Detected City:{' '}
            <strong style={{ color: config.color }}>{config.name}</strong>
          </p>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Phase 1 Infrastructure - Domain Detection Working
        </p>
      </div>
    </main>
  )
}
