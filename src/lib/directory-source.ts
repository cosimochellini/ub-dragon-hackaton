// Build the directory's `DirectorySource` from the real Unobravo export files
// (studios, doctors, Calendly availability). This is the production-swap point
// that used to read a hand-tuned seed + `expandDirectory`.
//
// Pure and deterministic given `referenceDate` (only the availability resolver
// depends on it): same input → same studios/therapists in the same order, so
// SSR markup and client hydration agree and ids/keys stay stable.

import { hash } from './hash'
import { resolveWeek } from './availability-schedule'
import studiosRaw from '@/data/studios.json'
import doctorsRaw from '@/data/doctors.json'
import availabilityRaw from '@/data/doctor_availability.json'
import type { CalendlyAvailability } from './availability-schedule'
import type {
  AvatarVariant,
  DirectorySource,
  Gender,
  ServiceType,
  Studio,
  StudioType,
  TherapistRecord,
} from './types'

interface RawStudio {
  studio_id: string
  studio_type: string
  studio_name: string
  studio_zone: string | null
  latitude: number
  longitude: number
}

interface RawDoctor {
  doctor_id: number
  doctor_name: string
  doctor_lastname: string
  therapy_type: string
  gender: string
  age: number
  studio_id: string
  active: boolean
  photo_url: string | null
}

const studios = studiosRaw as RawStudio[]
const doctors = doctorsRaw as RawDoctor[]
const availability = availabilityRaw as CalendlyAvailability[]

const AVATARS: AvatarVariant[] = ['candy8', 'candy4', 'smurf', 'grey']
/** Pad so projected studio pins never sit hard against the stylized-map edges. */
const MAP_PAD = 6

function studioType(raw: string): StudioType {
  // The only true Unobravo hub is the clinic; doc_/partner_ studios read as
  // independent neighbourhood pins.
  return raw === 'ub_clinic' ? 'unobravo' : 'private'
}

function genderOf(raw: string): Gender | null {
  if (raw === 'Donna') return 'female'
  if (raw === 'Uomo') return 'male'
  return null
}

function servicesOf(therapyType: string): ServiceType[] {
  const services: ServiceType[] = ['individual']
  if (therapyType.includes('coppia')) services.push('couples')
  return services
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts.at(0) ?? ''
  const last = parts.length > 1 ? (parts.at(-1) ?? first) : first
  return ((first.at(0) ?? '') + (last.at(0) ?? '')).toUpperCase()
}

/** Linear lng/lat → 0–100% projection for the stylized fallback map. */
function buildStudios(): Record<string, Studio> {
  const lats = studios.map((s) => s.latitude)
  const lngs = studios.map((s) => s.longitude)
  const latMin = Math.min(...lats)
  const latMax = Math.max(...lats)
  const lngMin = Math.min(...lngs)
  const lngMax = Math.max(...lngs)
  const span = 100 - 2 * MAP_PAD

  const project = (value: number, min: number, max: number): number => {
    if (max === min) return 50
    return MAP_PAD + ((value - min) / (max - min)) * span
  }
  const round = (n: number): number => Math.round(n * 10) / 10

  const out: Record<string, Studio> = {}
  for (const s of studios) {
    out[s.studio_id] = {
      id: s.studio_id,
      type: studioType(s.studio_type),
      name: s.studio_name,
      area: s.studio_zone ?? 'Milano',
      // North is up, so latitude (which grows northward) maps to a smaller y.
      map: {
        x: round(project(s.longitude, lngMin, lngMax)),
        y: round(MAP_PAD + span - (project(s.latitude, latMin, latMax) - MAP_PAD)),
      },
      coords: { lat: s.latitude, lng: s.longitude },
    }
  }
  return out
}

function buildTherapists(
  studioMap: Record<string, Studio>,
  referenceDate: Date,
): TherapistRecord[] {
  const availabilityById = new Map<number, CalendlyAvailability>(
    availability.map((a) => [a.doctor_id, a]),
  )
  const records: TherapistRecord[] = []
  for (const d of doctors) {
    if (!d.active) continue
    const gender = genderOf(d.gender)
    const studio = studioMap[d.studio_id] as Studio | undefined
    // Defensive: skip records we can't place or classify (none in the current
    // export — all are active, gendered, and point at a known studio).
    if (!gender || !studio) continue

    const name = `${d.doctor_name} ${d.doctor_lastname}`.trim()
    records.push({
      id: String(d.doctor_id),
      name,
      initials: initialsOf(name),
      title: gender === 'female' ? 'Psicologa' : 'Psicologo',
      gender,
      services: servicesOf(d.therapy_type),
      studio: d.studio_id,
      avatar: AVATARS[hash(d.doctor_id) % AVATARS.length],
      photoUrl: d.photo_url ?? undefined,
      age: d.age,
      availability: resolveWeek(availabilityById.get(d.doctor_id), referenceDate),
    })
  }
  return records
}

/**
 * Convert the raw exports into the `DirectorySource` shape the data layer
 * resolves into `Therapist[]`. Only **active** doctors are surfaced; all 36
 * studios are kept (unreferenced ones simply never render).
 */
export function buildDirectorySource(referenceDate: Date): DirectorySource {
  const studioMap = buildStudios()
  return {
    studios: studioMap,
    therapists: buildTherapists(studioMap, referenceDate),
  }
}
