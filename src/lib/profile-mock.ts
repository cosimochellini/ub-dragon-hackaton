import { hash } from './hash'
import type {
  EducationEntry,
  StyleAxis,
  Studio,
  TherapistProfile,
  TherapistRecord,
} from './types'

/**
 * Deterministic mock for the rich profile fields. Like `directory-mock`, this
 * is **pure** — every value is derived from the therapist's stable id via the
 * shared avalanche `hash` (no `Math.random`, no `Date.now`), so SSR markup and
 * client hydration agree and a given therapist always shows the same profile.
 *
 * Production-swap point: replace `buildProfile` with the real profile fields
 * coming back from the API/DB.
 */

const ORIENTATIONS = [
  'Cognitive-behavioural',
  'Psychodynamic',
  'Systemic-relational',
  'Humanistic-integrative',
  'Strategic',
  'Gestalt',
]
const TOPIC_POOL = [
  'Anxiety',
  'Depression',
  'Stress & burnout',
  'Self-esteem',
  'Life transitions',
  'Relationships',
  'Grief & loss',
  'Trauma',
  'Personal growth',
  'Work & career',
  'Sleep difficulties',
  'Panic attacks',
]
const UNIVERSITIES = [
  'University of Milan',
  'Università Cattolica del Sacro Cuore',
  'University of Padua',
  'University of Bologna',
  'Sapienza University of Rome',
  'University of Turin',
]
const SPECIALIZATION_SCHOOLS = [
  'Milan School of Psychotherapy',
  'Italian Society of Behavioural and Cognitive Therapy',
  'European Institute of Systemic Therapy',
  'Milan Institute of Gestalt',
]
const MASTER_TOPICS = [
  'Clinical Neuropsychology',
  'Child & Adolescent Psychology',
  'EMDR & Trauma',
  'Couples & Family Therapy',
  'Mindfulness-Based Interventions',
]

/** Stable per-therapist seed from the id ("t7" → 6); falls back to 0. */
function seedOf(id: string): number {
  const n = Number.parseInt(id.replace(/^\D+/, ''), 10)
  return Number.isFinite(n) ? n - 1 : 0
}

/** Join into natural English: ["a","b","c"] → "a, b and c". */
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

/** `count` distinct members of `pool`, chosen deterministically from `seed`. */
function pickDistinct(pool: string[], count: number, seed: number): string[] {
  const picks = new Set<number>()
  let k = hash(seed)
  while (picks.size < count && picks.size < pool.length) {
    k = hash(k)
    picks.add(k % pool.length)
  }
  return [...picks].map((i) => pool[i])
}

function buildTopics(record: TherapistRecord, seed: number): string[] {
  const offersCouples = record.services.includes('couples')
  const fromPool = pickDistinct(TOPIC_POOL, offersCouples ? 2 : 3, seed * 17 + 3)
  return offersCouples ? ['Couples therapy', ...fromPool] : fromPool
}

function buildBio(
  first: string,
  orientation: string,
  years: number,
  topics: string[],
  peopleHelped: number,
  seed: number,
): string {
  const approach = orientation.toLowerCase()
  const focus = joinList(topics.map((t) => t.toLowerCase()))
  const templates = [
    `${first} is a psychologist and psychotherapist with a ${approach} approach. Over ${years}+ years of practice, ${first} has supported people working through ${focus}, building a warm, judgement-free space where change feels possible.`,
    `With ${years}+ years of experience, ${first} blends a ${approach} approach with genuine curiosity about each person's story. Sessions focus on ${focus}, moving at a pace that feels right for you.`,
    `${first} believes therapy works best as a partnership. Grounded in ${approach} practice and ${years}+ years alongside more than ${peopleHelped} people, ${first} helps with ${focus} through practical, collaborative work.`,
  ]
  return templates[hash(seed * 31 + 9) % templates.length]
}

function buildEducation(
  orientation: string,
  alboRegion: string,
  alboNumber: string,
  seed: number,
): EducationEntry[] {
  const university = UNIVERSITIES[hash(seed * 41 + 11) % UNIVERSITIES.length]
  const school =
    SPECIALIZATION_SCHOOLS[hash(seed * 43 + 13) % SPECIALIZATION_SCHOOLS.length]
  const entries: EducationEntry[] = [
    {
      kind: 'registration',
      title: 'Professional registration',
      detail: `Order of Psychologists — ${alboRegion}, no. ${alboNumber}`,
    },
    {
      kind: 'degree',
      title: 'Degree',
      detail: `Degree in Psychology — ${university}`,
    },
    {
      kind: 'specialization',
      title: 'Specialization',
      detail: `Specialization in ${orientation} Psychotherapy — ${school}`,
    },
  ]
  // ~half also hold a master's; deterministic so the timeline length is stable.
  if (hash(seed * 47 + 17) % 2 === 0) {
    const topic = MASTER_TOPICS[hash(seed * 53 + 19) % MASTER_TOPICS.length]
    entries.push({ kind: 'master', title: 'Master', detail: `Master in ${topic}` })
  }
  return entries
}

export function buildProfile(
  record: TherapistRecord,
  studios: Record<string, Studio>,
): TherapistProfile {
  const seed = seedOf(record.id)
  const first = record.name.split(' ', 1)[0]
  const alboRegion = 'Lombardy'
  const alboNumber = String(1000 + (hash(seed * 7 + 1) % 9000))
  const age = 30 + (hash(seed * 11 + 2) % 29) // 30–58
  const expCap = Math.min(20, age - 25) // ≥5, keeps experience plausible vs age
  const yearsExperience = 3 + (hash(seed * 13 + 4) % Math.max(1, expCap - 2))
  const peopleHelped = 12 + (hash(seed * 19 + 5) % 238) // 12–249
  const orientation = ORIENTATIONS[hash(seed * 23 + 6) % ORIENTATIONS.length]
  // `studios[key]` is typed as non-optional but can be absent at runtime (e.g.
  // an unknown studio id); widen so the fallback is real, not dead code.
  const area = (studios[record.studio] as Studio | undefined)?.area ?? 'Milan'
  const topics = buildTopics(record, seed)

  // Axis positions, 18–82, biased away from the extremes for a natural look.
  const axis = (salt: number): number => 18 + (hash(seed * 59 + salt) % 65)
  const styleAxes: StyleAxis[] = [
    { left: 'Formal', right: 'Informal', value: axis(21) },
    { left: 'Reflective', right: 'Rational', value: axis(22) },
  ]
  const sessionAxes: StyleAxis[] = [
    { left: 'Goes with the flow', right: 'Follows a plan', value: axis(23) },
    { left: 'Lets you lead', right: 'Guides the conversation', value: axis(24) },
  ]

  return {
    headline: 'Psychologist & Psychotherapist',
    alboRegion,
    alboNumber,
    age,
    city: 'Milan',
    yearsExperience,
    peopleHelped,
    orientation,
    setting: `in person · ${area}`,
    topics,
    styleAxes,
    sessionAxes,
    bio: buildBio(first, orientation, yearsExperience, topics, peopleHelped, seed),
    education: buildEducation(orientation, alboRegion, alboNumber, seed),
  }
}
