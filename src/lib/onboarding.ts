// Onboarding questionnaire: persistence + the (fictitious) mapping from answers
// to directory filters. Plain client/SSR-safe module — deliberately NOT named
// `*.server.ts` so the TanStack Start client RPC build doesn't treat it as a
// server function module.

import type { GenderFilter, ServiceType } from './types'

export type PathChoice = 'individual' | 'couples' | 'minor'
export type ReasonChoice =
  | 'anxiety'
  | 'sadness'
  | 'work'
  | 'relationships'
  | 'growth'
  | 'none'
export type DurationChoice =
  | 'lt_month'
  | 'one_three'
  | 'six_months'
  | 'one_year'
  | 'gt_year'
  | 'unsure'
export type PriorTherapyChoice = 'past' | 'current' | 'first'
export type CityChoice = 'milan'
export type GenderPrefChoice = 'female' | 'male' | 'any'

/** The full set of questionnaire answers we persist for a user. */
export interface OnboardingAnswers {
  path: PathChoice
  /** Self-reported age. */
  age: number
  reasons: ReasonChoice[]
  /** Optional free-text note. */
  more?: string
  duration: DurationChoice
  priorTherapy?: PriorTherapyChoice
  city: CityChoice
  genderPref: GenderPrefChoice
}

/** Bump when the stored shape changes; older payloads are then discarded. */
export const ONBOARDING_VERSION = 1
export const ONBOARDING_STORAGE_KEY = 'ub-onboarding-v1'

interface StoredOnboarding {
  version: number
  answers: OnboardingAnswers
}

const PATHS = new Set<PathChoice>(['individual', 'couples', 'minor'])
const REASONS = new Set<ReasonChoice>([
  'anxiety',
  'sadness',
  'work',
  'relationships',
  'growth',
  'none',
])
const DURATIONS = new Set<DurationChoice>([
  'lt_month',
  'one_three',
  'six_months',
  'one_year',
  'gt_year',
  'unsure',
])
const PRIOR_THERAPY = new Set<PriorTherapyChoice>(['past', 'current', 'first'])
const GENDER_PREFS = new Set<GenderPrefChoice>(['female', 'male', 'any'])

function isAnswers(value: unknown): value is OnboardingAnswers {
  if (typeof value !== 'object' || value === null) return false
  const a = value as Record<string, unknown>
  return (
    PATHS.has(a.path as PathChoice) &&
    typeof a.age === 'number' &&
    Number.isFinite(a.age) &&
    Array.isArray(a.reasons) &&
    a.reasons.every((r) => REASONS.has(r as ReasonChoice)) &&
    (a.more === undefined || typeof a.more === 'string') &&
    DURATIONS.has(a.duration as DurationChoice) &&
    (a.priorTherapy === undefined ||
      PRIOR_THERAPY.has(a.priorTherapy as PriorTherapyChoice)) &&
    a.city === 'milan' &&
    GENDER_PREFS.has(a.genderPref as GenderPrefChoice)
  )
}

/**
 * Read saved answers from `localStorage`. Returns `null` on the server, when
 * nothing is stored, on a version mismatch, or when the payload is malformed —
 * so callers can treat `null` uniformly as "show the questionnaire".
 */
export function loadOnboarding(): OnboardingAnswers | null {
  // `localStorage` only exists in the browser; the SSR build dead-code-eliminates
  // this branch (matching MapView's `import.meta.env.SSR` client gate).
  if (import.meta.env.SSR) return null
  try {
    const raw = globalThis.localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredOnboarding>
    if (parsed.version !== ONBOARDING_VERSION) return null
    return isAnswers(parsed.answers) ? parsed.answers : null
  } catch {
    return null
  }
}

/** Persist answers. No-ops on the server or when storage is unavailable. */
export function saveOnboarding(answers: OnboardingAnswers): void {
  if (import.meta.env.SSR) return
  try {
    const payload: StoredOnboarding = { version: ONBOARDING_VERSION, answers }
    globalThis.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify(payload),
    )
  } catch {
    // Ignore quota / privacy-mode errors — onboarding state is non-critical.
  }
}

/** Remove saved answers (used by "Edit preferences" to re-open the flow). */
export function clearOnboarding(): void {
  if (import.meta.env.SSR) return
  try {
    globalThis.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  } catch {
    // Ignore.
  }
}

export interface OnboardingFilters {
  service: ServiceType
  gender: GenderFilter
}

/**
 * Map questionnaire answers onto the directory's filter dimensions. Only two
 * answers drive the (fictitious) filtering: `path`→service and
 * `genderPref`→gender. Everything else is stored for demo/context only.
 */
export function answersToFilters(answers: OnboardingAnswers): OnboardingFilters {
  return {
    service: answers.path === 'couples' ? 'couples' : 'individual',
    gender:
      answers.genderPref === 'female'
        ? 'female'
        : answers.genderPref === 'male'
          ? 'male'
          : 'any',
  }
}
