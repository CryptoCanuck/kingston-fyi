import React from 'react'

import {
  Btn,
  CatTag,
  ContactRow,
  DotSep,
  Eyebrow,
  Field,
  FilterGroup,
  Icon,
  ICONS,
  type IconName,
  Logo,
  Meta,
  Ph,
  PriceTag,
  ReviewLine,
  SectionHead,
  Select,
  Stars,
  Tag,
  TagOutline,
  TextArea,
  TextInput,
} from '@/components/ui'

import { InteractiveDemos } from './InteractiveDemos'

/* Visual sandbox for the civic-editorial design system. Renders every atom and
   molecule with representative props so the system can be reviewed in one place. */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginTop: 44 }}>
    <SectionHead title={title} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
      {children}
    </div>
  </section>
)

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="card" style={{ padding: 'var(--pad)', minWidth: 240 }}>
    <div className="cb">{children}</div>
  </div>
)

export default function SandboxPage() {
  const iconNames = Object.keys(ICONS) as IconName[]

  return (
    <div className="kf-wrap kf-route" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <Eyebrow as="div">Design System</Eyebrow>
      <h1 style={{ fontSize: 40, marginTop: 8 }}>Kingston.FYI component sandbox</h1>
      <p className="muted" style={{ marginTop: 10, maxWidth: 640 }}>
        Civic-editorial system — deep slate blue, limestone off-white, a single amber accent. Every
        token, font, and component below is wired from the locked design reference.
      </p>

      <Section title="Logo">
        <Logo />
        <div style={{ background: 'var(--slate-800)', padding: 16, borderRadius: 'var(--r)' }}>
          <Logo light />
        </div>
      </Section>

      <Section title="Buttons">
        <Btn variant="primary">Primary</Btn>
        <Btn variant="dark">Dark</Btn>
        <Btn variant="ghost">Ghost</Btn>
        <Btn variant="primary" size="sm">
          Small
        </Btn>
        <Btn variant="primary" size="lg">
          Large
        </Btn>
        <Btn variant="ghost">
          <Icon name="plus" size={16} /> With icon
        </Btn>
      </Section>

      <Section title="Tags & category chips">
        <CatTag catKey="local" label="Local" />
        <CatTag catKey="politics" label="Politics" />
        <CatTag catKey="business" label="Business" />
        <CatTag catKey="sports" label="Sports" />
        <CatTag catKey="arts" label="Arts" />
        <CatTag catKey="opinion" label="Opinion" />
        <Tag>Default slate</Tag>
        <Tag small>Small</Tag>
        <TagOutline>Outline tag</TagOutline>
        <PriceTag value="$$" />
      </Section>

      <Section title="Eyebrow & typography">
        <div className="cb">
          <Eyebrow>The Limestone Letter</Eyebrow>
          <h2 style={{ fontSize: 30 }}>
            A credible local newspaper, crossed with a community guide
          </h2>
          <p className="muted">
            Body copy in Source Sans 3 at 17px / 1.55. Headlines in Newsreader serif, weight 600,
            tight leading, balanced wrapping.
          </p>
        </div>
      </Section>

      <Section title="Ratings & meta">
        <Card>
          <Stars value={4.5} count={128} />
          <Stars value={3} />
          <Stars value={5} showNum={false} />
          <Meta icon="calendar">May 31, 2026</Meta>
          <Meta icon="pin">Downtown Kingston</Meta>
          <span className="meta">
            <Icon name="clock" size={14} /> 7:00 PM <DotSep /> Doors 6:30
          </span>
        </Card>
      </Section>

      <Section title="Form fields">
        <div style={{ minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextInput label="Full name" placeholder="Jane Doe" />
          <Select label="Category" defaultValue="">
            <option value="" disabled>
              Choose a category
            </option>
            <option value="news">News</option>
            <option value="events">Events</option>
            <option value="business">Business</option>
          </Select>
          <TextArea label="Message" placeholder="Tell us about your listing…" />
          <Field label="Bare field wrapper">
            <input className="input" placeholder="Manually composed" />
          </Field>
        </div>
      </Section>

      <Section title="Interactive controls (client)">
        <div style={{ minWidth: 360 }}>
          <InteractiveDemos />
        </div>
      </Section>

      <Section title="Filter group, contact rows & reviews">
        <Card>
          <FilterGroup label="Neighbourhood">
            <span className="chip is-active" style={{ cursor: 'default' }}>
              Downtown
            </span>
            <span className="chip" style={{ cursor: 'default' }}>
              Williamsville
            </span>
          </FilterGroup>
        </Card>
        <Card>
          <ContactRow icon="phone" href="tel:+16135551234">
            (613) 555-1234
          </ContactRow>
          <ContactRow icon="globe" href="https://example.com" external>
            example.com
          </ContactRow>
          <ContactRow icon="pin">123 Princess St, Kingston, ON</ContactRow>
          <ContactRow icon="mail" href="mailto:hi@example.com">
            hi@example.com
          </ContactRow>
        </Card>
        <Card>
          <ReviewLine author="Sam R." rating={5} date="2 weeks ago">
            Best butter tarts in the Limestone City. Friendly staff and a cozy patio.
          </ReviewLine>
          <ReviewLine author="Alex P." rating={4} date="1 month ago">
            Solid coffee and quick service. Gets busy on weekends.
          </ReviewLine>
        </Card>
      </Section>

      <Section title="Image placeholders">
        <div style={{ width: 220 }}>
          <Ph hue="ph-a" label="News" ratio={16 / 9} rounded icon="pin" />
        </div>
        <div style={{ width: 220 }}>
          <Ph hue="ph-c" label="Event" ratio={16 / 9} rounded icon="calendar" />
        </div>
        <div style={{ width: 220 }}>
          <Ph hue="ph-e" label="Business" ratio={16 / 9} rounded icon="globe" />
        </div>
      </Section>

      <Section title="Icon set">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {iconNames.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                width: 64,
              }}
            >
              <Icon name={name} size={22} />
              <span className="faint" style={{ fontSize: 11 }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
