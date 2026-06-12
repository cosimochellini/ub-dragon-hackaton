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
}

/** Raw therapist as stored in the mock JSON (production-swap point). */
export interface TherapistRecord {
  id: string
  name: string
  initials: string
  title: string
  gender: Gender
  services: ServiceType[]
  studio: string
  avatar: AvatarVariant
  /** 7 entries (dayOffset 0..6 from "today"), each a list of "HH:MM" slots. */
  availability: string[][]
}

/** A single bookable day after availability has been resolved to real dates. */
export interface Day {
  key: number
  /** "Today" | "Tomorrow" | weekday abbreviation. */
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

/** Therapist with availability resolved to concrete `Day`s. */
export type Therapist = Omit<TherapistRecord, 'availability'> & { days: Day[] }

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
