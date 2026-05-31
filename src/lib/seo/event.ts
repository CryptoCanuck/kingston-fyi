// Event JSON-LD adapter (FR18, NFR1). Maps an event document to a located schema.org Event,
// delegating place resolution to lib/events/location so the node ALWAYS carries a location
// (venue business or the event's own), per FR62.

import { type JsonLd, buildEvent } from './jsonld'
import { resolveEventPlace, type EventLocationSource } from '../events/location'

export interface EventJsonLdSource extends EventLocationSource {
  title: string
  /** Site-relative canonical path to the event detail page. */
  path: string
  /** ISO start datetime. */
  startsAt: string
  /** ISO end datetime (optional). */
  endsAt?: string | null
  blurb?: string | null
}

/** Build located Event JSON-LD for an event detail page. */
export const buildEventJsonLd = (source: EventJsonLdSource): JsonLd =>
  buildEvent({
    name: source.title,
    path: source.path,
    startDate: source.startsAt,
    endDate: source.endsAt ?? undefined,
    description: source.blurb ?? undefined,
    location: resolveEventPlace(source),
  })
