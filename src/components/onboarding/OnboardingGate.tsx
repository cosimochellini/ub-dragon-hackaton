import { useState, useSyncExternalStore } from 'react'
import { MilanApp } from '../MilanApp'
import { Questionnaire } from './Questionnaire'
import {
  answersToFilters,
  clearOnboarding,
  loadOnboarding,
  saveOnboarding,
} from '@/lib/onboarding'
import type { OnboardingAnswers } from '@/lib/onboarding'
import type { Studio, Therapist } from '@/lib/types'

// Stable no-op subscription: the "mounted" snapshot never changes after the
// first client render (same pattern as MapView's SSR-safe client gate).
const noop = () => {}
const subscribe = () => noop

interface GateState {
  status: 'questionnaire' | 'done'
  answers: OnboardingAnswers | null
}

function Splash() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-cream">
      <img
        src="/logo-unobravo-black.svg"
        alt="Unobravo"
        className="h-5 opacity-80"
      />
    </div>
  )
}

/**
 * First-entry gate around the directory. The server and the first hydration
 * render emit a neutral splash (identical markup — no hydration mismatch); once
 * mounted in the browser we read `localStorage` and either show the onboarding
 * questionnaire (new visitor) or `MilanApp` with the saved answers pre-seeding
 * the filters (returning visitor). "Edit preferences" clears storage and
 * re-opens the questionnaire.
 */
export function OnboardingGate({
  therapists,
  studios,
}: {
  therapists: Therapist[]
  studios: Record<string, Studio>
}) {
  // Client-only gate without effect-driven state (see MapView): server + first
  // hydration see `false` → splash; the client re-renders `true` and resolves.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  // Read storage once, lazily. On the server this returns null (window-guarded);
  // the value is only ever rendered after `mounted` is true, so there is no
  // hydration mismatch from the server/client snapshots differing.
  const [state, setState] = useState<GateState>(() => {
    const saved = loadOnboarding()
    return { status: saved ? 'done' : 'questionnaire', answers: saved }
  })
  // Remounts MilanApp after each completion so it re-seeds its filter state.
  const [version, setVersion] = useState(0)

  if (!mounted) return <Splash />

  if (state.status === 'questionnaire') {
    return (
      <Questionnaire
        onComplete={(answers) => {
          saveOnboarding(answers)
          setState({ status: 'done', answers })
          setVersion((v) => v + 1)
        }}
      />
    )
  }

  const filters = state.answers ? answersToFilters(state.answers) : null
  return (
    <MilanApp
      key={version}
      therapists={therapists}
      studios={studios}
      initialService={filters?.service}
      initialGender={filters?.gender}
      onEditPreferences={() => {
        clearOnboarding()
        setState({ status: 'questionnaire', answers: null })
      }}
    />
  )
}
