import { useMemo, useState } from 'react'
import { Header } from './shell/Header'
import { FloatingToggle } from './shell/FloatingToggle'
import { TherapistList } from './therapist/TherapistList'
import { MapView } from './map/MapView'
import { MapCarousel } from './MapCarousel'
import { BookingSheet } from './booking/BookingSheet'
import { useBooking } from '@/hooks/useBooking'
import { filterTherapists } from '@/lib/filter'
import type { GenderFilter, ServiceType, Studio, Therapist } from '@/lib/types'

type View = 'list' | 'map'

/**
 * The effective highlighted map pin: the user's pick while it's still in the
 * current filtered list, otherwise the first result (or none when the list is
 * empty). Derived during render so we never store a selection the list
 * contradicts — no syncing effect, no extra render.
 */
function effectiveSelection(
  list: Therapist[],
  rawId: string | null,
): string | null {
  if (list.length === 0) return null
  if (list.some((t) => t.id === rawId)) return rawId
  return list[0].id
}

/**
 * The directory screen. Owns all ephemeral UI state (view, filters, selected
 * map pin, transient booking). Data comes in as props so this is decoupled
 * from the Query/SSR layer and easy to test.
 */
export function MilanApp({
  therapists,
  studios,
  initialService = 'individual',
  initialGender = 'any',
  onEditPreferences,
}: {
  therapists: Therapist[]
  studios: Record<string, Studio>
  /** Pre-seed the visible Service filter (from onboarding). */
  initialService?: ServiceType
  /** Pre-seed the visible Gender filter (from onboarding). */
  initialGender?: GenderFilter
  /** Re-open the onboarding questionnaire, if mounted behind a gate. */
  onEditPreferences?: () => void
}) {
  const [view, setView] = useState<View>('list')
  const [service, setService] = useState<ServiceType>(initialService)
  const [gender, setGender] = useState<GenderFilter>(initialGender)
  const [selectedMapId, setSelectedMapId] = useState<string | null>(
    therapists[0]?.id ?? null,
  )
  const { booking, booked, pick, confirm, closeSheet } = useBooking()

  const list = useMemo(
    () => filterTherapists(therapists, service, gender),
    [therapists, service, gender],
  )
  const effectiveSelectedId = effectiveSelection(list, selectedMapId)

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <Header
        service={service}
        setService={setService}
        gender={gender}
        setGender={setGender}
        count={list.length}
        onEditPreferences={onEditPreferences}
      />

      <div className="relative flex-1 overflow-hidden">
        {view === 'list' ? (
          <TherapistList
            key={`${service}-${gender}`}
            list={list}
            studios={studios}
            onPick={pick}
          />
        ) : (
          <>
            <MapView
              therapists={list}
              studios={studios}
              selectedId={effectiveSelectedId}
              onSelect={setSelectedMapId}
            />
            {list.length > 0 ? (
              <MapCarousel
                list={list}
                studios={studios}
                selectedId={effectiveSelectedId}
                onPick={pick}
              />
            ) : null}
          </>
        )}
      </div>

      <FloatingToggle
        view={view}
        onToggle={() => setView((v) => (v === 'list' ? 'map' : 'list'))}
      />
      <BookingSheet
        booking={booking}
        booked={booked}
        studios={studios}
        onClose={closeSheet}
        onConfirm={confirm}
      />
    </div>
  )
}
