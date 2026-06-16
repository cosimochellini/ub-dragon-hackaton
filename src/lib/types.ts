// Domain models for the Milan therapist directory.

export type ServiceType = 'individual' | 'couples'
export type Gender = 'female' | 'male'
export type GenderFilter = 'any' | Gender
export type StudioType = 'unobravo' | 'private'
export type AvatarVariant = 'candy8' | 'candy4' | 'smurf' | 'grey'

export interface Studio {
  id: string
  type: StudioType
  name: string
  area: string
  /** Position on the stylized map, in percentages (0–100). */
  map: { x: number; y: number }
  /** Real-world location for the Leaflet map (the studio's exact coordinates). */
  coords: { lat: number; lng: number }
}

/** Raw therapist as stored in the JSON source (production-swap point). */
export interface TherapistRecord {
  id: string
  name: string
  initials: string
  title: string
  gender: Gender
  services: ServiceType[]
  studio: string
  /** Illustrated fallback avatar (used when `photoUrl` is absent or fails). */
  avatar: AvatarVariant
  /** Real profile photo, when available; falls back to the initials avatar. */
  photoUrl?: string
  /** Real age, when known; otherwise derived deterministically in the profile. */
  age?: number
  /** 7 entries (dayOffset 1..7 from "today" — starting tomorrow), each a list of "HH:MM" slots. */
  availability: string[][]
}

/** A single bookable day after availability has been resolved to real dates. */
export interface Day {
  key: number
  /** "Tomorrow" | weekday abbreviation. */
  label: string
  /** Weekday abbreviation, e.g. "Mon". */
  dow: string
  /** Day of month, e.g. 12. */
  day: number
  /** Month abbreviation, e.g. "Jun". */
  month: string
  /** Composed label, e.g. "Fri 12 Jun". */
  dateLabel: string
  slots: string[]
}

/**
 * A personality/session-style spectrum shown as a labelled bar on the profile,
 * e.g. Formal ←→ Informal. `value` is the position on the axis, 0–100, where 0
 * sits hard against `left` and 100 hard against `right`.
 */
export interface StyleAxis {
  left: string
  right: string
  value: number
}

/** One entry in a therapist's education/qualifications timeline. */
export interface EducationEntry {
  kind: 'registration' | 'degree' | 'specialization' | 'master'
  /** Short row title, e.g. "Degree". */
  title: string
  /** Free-text detail, e.g. the institution and year. */
  detail: string
}

/**
 * The rich, profile-page-only fields. Derived deterministically per therapist
 * by `buildProfile` (mock POC data) rather than stored in the JSON seed, so the
 * seed shape stays a clean production-swap point.
 */
export interface TherapistProfile {
  /** Display headline, e.g. "Psychologist & Psychotherapist". */
  headline: string
  /** Region of the professional register (Ordine degli Psicologi). */
  alboRegion: string
  /** Registration number on that register. */
  alboNumber: string
  age: number
  city: string
  yearsExperience: number
  /** People supported on Unobravo. */
  peopleHelped: number
  /** Therapeutic orientation, e.g. "Cognitive-behavioural". */
  orientation: string
  /** Working setting line, lower-cased for mid-sentence use, e.g. "in person · Navigli". */
  setting: string
  /** Specialization topics (3–4). */
  topics: string[]
  /** Personality-style axes (Formal↔Informal, Reflective↔Rational). */
  styleAxes: StyleAxis[]
  /** Session-conduct axes (flow↔plan, follows↔leads). */
  sessionAxes: StyleAxis[]
  /** Self-description paragraph. */
  bio: string
  education: EducationEntry[]
}

/** Therapist with availability resolved to concrete `Day`s and profile attached. */
export type Therapist = Omit<TherapistRecord, 'availability'> & {
  days: Day[]
  profile: TherapistProfile
}

export interface Booking {
  t: Therapist
  day: Day
  slot: string
}

/** Shape returned by the data layer / consumed by the UI. */
export interface DirectoryData {
  studios: Record<string, Studio>
  therapists: Therapist[]
}

/** Raw shape of the mock JSON before availability resolution. */
export interface DirectorySource {
  studios: Record<string, Studio>
  therapists: TherapistRecord[]
}
