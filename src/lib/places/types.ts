// Minimal typings for the Google Places API (New) fields we request (AR22). We deliberately
// model only what the seeding pipeline consumes; the full Place resource is much larger.

export interface PlacesLatLng {
  latitude: number
  longitude: number
}

export interface PlacesLocalizedText {
  text: string
  languageCode?: string
}

export interface PlacesAddressComponent {
  longText: string
  shortText: string
  types: string[]
}

/** A single open/close transition within a week (day: 0 = Sunday … 6 = Saturday). */
export interface PlacesOpeningPoint {
  day: number
  hour: number
  minute: number
}

export interface PlacesOpeningPeriod {
  open?: PlacesOpeningPoint
  close?: PlacesOpeningPoint
}

export interface PlacesOpeningHours {
  periods?: PlacesOpeningPeriod[]
  weekdayDescriptions?: string[]
}

export type PlacesBusinessStatus =
  | 'OPERATIONAL'
  | 'CLOSED_TEMPORARILY'
  | 'CLOSED_PERMANENTLY'
  | 'BUSINESS_STATUS_UNSPECIFIED'

/** A Place as returned by `places:searchText` for the field mask we request. */
export interface Place {
  id: string
  displayName?: PlacesLocalizedText
  formattedAddress?: string
  location?: PlacesLatLng
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  regularOpeningHours?: PlacesOpeningHours
  types?: string[]
  primaryType?: string
  businessStatus?: PlacesBusinessStatus
  addressComponents?: PlacesAddressComponent[]
}
