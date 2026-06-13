import { hash } from './hash'
import type {
  AvatarVariant,
  DirectorySource,
  Gender,
  ServiceType,
  Studio,
  TherapistRecord,
} from './types'

/**
 * Mock-data expansion for the directory. The committed `therapists.json` holds
 * a small, hand-tuned seed (4 studios + 6 named therapists); this module grows
 * it to a realistic directory at runtime so the list is long enough to demo
 * infinite scroll.
 *
 * Everything here is **pure and deterministic** — no `Math.random`, no
 * `Date.now`. The same seed always yields the same therapists in the same
 * order, so SSR markup and client hydration agree and ids/keys stay stable.
 * Concrete dates are still applied later by `buildDays` using the live request
 * instant; only the offset-based availability *pattern* is generated here.
 */

/**
 * ~11 extra Milan studios so 60 therapists spread across the map and carousel.
 * These are all private studios: Unobravo runs a single hub studio (the seed
 * `ub_romana`), so we don't litter the map with repeated "Unobravo studio"
 * pins — every studio here reads as its own neighbourhood.
 */
const NEW_STUDIOS: Record<string, Studio> = {
  navigli: {
    id: 'navigli',
    type: 'private',
    name: 'Private studio',
    area: 'Navigli',
    map: { x: 38, y: 62 },
    coords: { lat: 45.449, lng: 9.175 },
  },
  garibaldi: {
    id: 'garibaldi',
    type: 'private',
    name: 'Private studio',
    area: 'Garibaldi',
    map: { x: 44, y: 18 },
    coords: { lat: 45.483, lng: 9.188 },
  },
  sempione: {
    id: 'sempione',
    type: 'private',
    name: 'Private studio',
    area: 'Sempione',
    map: { x: 18, y: 30 },
    coords: { lat: 45.476, lng: 9.169 },
  },
  loreto: {
    id: 'loreto',
    type: 'private',
    name: 'Private studio',
    area: 'Loreto',
    map: { x: 84, y: 30 },
    coords: { lat: 45.4855, lng: 9.215 },
  },
  ticinese: {
    id: 'ticinese',
    type: 'private',
    name: 'Private studio',
    area: 'Ticinese',
    map: { x: 40, y: 72 },
    coords: { lat: 45.453, lng: 9.182 },
  },
  porta_venezia: {
    id: 'porta_venezia',
    type: 'private',
    name: 'Private studio',
    area: 'Porta Venezia',
    map: { x: 66, y: 30 },
    coords: { lat: 45.475, lng: 9.205 },
  },
  lambrate: {
    id: 'lambrate',
    type: 'private',
    name: 'Private studio',
    area: 'Lambrate',
    map: { x: 90, y: 50 },
    coords: { lat: 45.484, lng: 9.239 },
  },
  bicocca: {
    id: 'bicocca',
    type: 'private',
    name: 'Private studio',
    area: 'Bicocca',
    map: { x: 74, y: 8 },
    coords: { lat: 45.518, lng: 9.212 },
  },
  san_siro: {
    id: 'san_siro',
    type: 'private',
    name: 'Private studio',
    area: 'San Siro',
    map: { x: 8, y: 48 },
    coords: { lat: 45.478, lng: 9.124 },
  },
  washington: {
    id: 'washington',
    type: 'private',
    name: 'Private studio',
    area: 'Washington',
    map: { x: 14, y: 60 },
    coords: { lat: 45.464, lng: 9.154 },
  },
  centrale: {
    id: 'centrale',
    type: 'private',
    name: 'Private studio',
    area: 'Centrale',
    map: { x: 72, y: 22 },
    coords: { lat: 45.486, lng: 9.205 },
  },
}

const FEMALE_NAMES = [
  'Sara',
  'Giulia',
  'Elena',
  'Chiara',
  'Francesca',
  'Martina',
  'Alessia',
  'Valentina',
  'Federica',
  'Silvia',
  'Laura',
  'Beatrice',
  'Camilla',
  'Ilaria',
  'Roberta',
]
const MALE_NAMES = [
  'Marco',
  'Luca',
  'Davide',
  'Andrea',
  'Matteo',
  'Simone',
  'Alessandro',
  'Stefano',
  'Giovanni',
  'Riccardo',
  'Tommaso',
  'Paolo',
  'Federico',
  'Nicola',
  'Giorgio',
]
const SURNAMES = [
  'Bianchi',
  'Rossi',
  'Ferrari',
  'Russo',
  'Esposito',
  'Romano',
  'Colombo',
  'Greco',
  'Bruno',
  'Gallo',
  'Conti',
  'Costa',
  'Fontana',
  'Caruso',
  'Marini',
  'Galli',
  'Rizzo',
  'Lombardi',
  'Barbieri',
  'Moretti',
  'Mancini',
  'Rinaldi',
  'Villa',
  'Sala',
  'Ferrara',
]
const AVATARS: AvatarVariant[] = ['candy8', 'candy4', 'smurf', 'grey']
const SLOT_POOL = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
]

function initialsOf(name: string): string {
  const parts = name.split(' ')
  const last = parts.at(-1) ?? parts[0]
  return (parts[0][0] + last[0]).toUpperCase()
}

/**
 * A deterministic 7-day availability pattern for a therapist `index`. ~30% of
 * days are empty; the rest carry 1–3 unique slots from `SLOT_POOL`, sorted
 * chronologically (zero-padded "HH:MM" sorts lexicographically = by time).
 */
function availabilityFor(index: number): string[][] {
  const days = Array.from({ length: 7 }, (_, day) => {
    const r = hash(index * 101 + day)
    if (r % 10 < 3) return []
    const count = 1 + (hash(r + 1) % 3)
    const picks = new Set<number>()
    let k = r
    while (picks.size < count) {
      k = hash(k)
      picks.add(k % SLOT_POOL.length)
    }
    // `SLOT_POOL` is already chronological, so filtering by the chosen indices
    // keeps slots sorted by time without an extra (mutating) sort.
    return SLOT_POOL.filter((_slot, i) => picks.has(i))
  })
  // Guarantee a bookable slot so every card can offer a time (and never shows
  // an empty week), regardless of directory size.
  if (days.every((slots) => slots.length === 0)) {
    const r = hash(index * 13 + 5)
    days[r % 7] = [SLOT_POOL[r % SLOT_POOL.length]]
  }
  return days
}

/**
 * Generate `count` therapists starting at `startIndex` (the number of seed
 * therapists already present), cycling deterministically through name, gender,
 * service, avatar and studio so the directory has a balanced, varied mix.
 */
function generateTherapists(
  startIndex: number,
  count: number,
  studioIds: string[],
): TherapistRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i
    const gender: Gender = index % 2 === 0 ? 'female' : 'male'
    const pool = gender === 'female' ? FEMALE_NAMES : MALE_NAMES
    const first = pool[index % pool.length]
    const last = SURNAMES[(index * 7) % SURNAMES.length]
    const name = `${first} ${last}`
    // ~40% of therapists also offer couples sessions; the rest individual only.
    const services: ServiceType[] =
      index % 5 < 2 ? ['individual', 'couples'] : ['individual']
    return {
      id: `t${index + 1}`,
      name,
      initials: initialsOf(name),
      title: gender === 'female' ? 'Psicologa' : 'Psicologo',
      gender,
      services,
      studio: studioIds[index % studioIds.length],
      avatar: AVATARS[index % AVATARS.length],
      availability: availabilityFor(index),
    }
  })
}

/**
 * Expand a seed directory up to `targetCount` therapists, adding the extra
 * Milan studios. The seed therapists/studios are preserved first and untouched;
 * generated therapists (ids `t7`, `t8`, …) are appended.
 */
export function expandDirectory(
  source: DirectorySource,
  targetCount: number,
): DirectorySource {
  const studios: Record<string, Studio> = { ...source.studios, ...NEW_STUDIOS }
  const studioIds = Object.keys(studios)
  const needed = Math.max(0, targetCount - source.therapists.length)
  const generated = generateTherapists(
    source.therapists.length,
    needed,
    studioIds,
  )
  return { studios, therapists: [...source.therapists, ...generated] }
}
