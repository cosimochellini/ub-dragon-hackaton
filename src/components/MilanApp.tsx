import { useMemo, useState } from 'react'
import { Header } from './shell/Header'
import { FloatingToggle } from './shell/FloatingToggle'
import { TherapistList } from './therapist/TherapistList'
import { MapView } from './map/MapView'
import { MapCarousel } from './MapCarousel'
import { EmptyState } from './shell/EmptyState'
import { BookingSheet } from './booking/BookingSheet'
import { useBooking } from '@/hooks/useBooking'
import { filterTherapists } from '@/lib/filter'
import { ZONE_LABELS } from '@/lib/onboarding'
import type { Zone } from '@/lib/onboarding'
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
  initialZone = null,
  onEditPreferences,
}: {
  therapists: Therapist[]
  studios: Record<string, Studio>
  /** Pre-seed the visible Service filter (from onboarding). */
  initialService?: ServiceType
  /** Pre-seed the visible Gender filter (from onboarding). */
  initialGender?: GenderFilter
  /** Silent zone pre-filter (from onboarding); not user-editable here. */
  initialZone?: Zone | null
  /** Re-open the onboarding questionnaire, if mounted behind a gate. */
  onEditPreferences?: () => void
}) {
  const [view, setView] = useState<View>('list')
  const [service, setService] = useState<ServiceType>(initialService)
  const [gender, setGender] = useState<GenderFilter>(initialGender)
  // The onboarding area is a silent, clearable pre-filter. Seed it only when it
  // actually yields therapists for the seeded service/gender — otherwise we'd
  // open on an empty directory (e.g. Couples in an area with no couples
  // studios). When skipped the user simply sees all areas; when applied, an
  // empty result still offers "Show all areas" to widen.
  const [zone, setZone] = useState<Zone | null>(() => {
    if (!initialZone) return null
    const seeded = filterTherapists(therapists, initialService, initialGender, {
      zone: initialZone,
      studios,
    })
    return seeded.length > 0 ? initialZone : null
  })
  const [selectedMapId, setSelectedMapId] = useState<string | null>(
    therapists[0]?.id ?? null,
  )
  const { booking, booked, pick, confirm, closeSheet } = useBooking()

  const list = useMemo(
    () => filterTherapists(therapists, service, gender, { zone, studios }),
    [therapists, service, gender, zone, studios],
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
            key={`${service}-${gender}-${zone ?? 'all'}`}
            list={list}
            studios={studios}
            onPick={pick}
            areaLabel={zone ? ZONE_LABELS[zone] : undefined}
            onClearArea={zone ? () => setZone(null) : undefined}
          />
        ) : list.length === 0 ? (
          // Map view has no list to host an empty state, so render the same
          // area-aware recovery here rather than leave an empty map.
          <div className="h-full overflow-y-auto">
            <EmptyState
              areaLabel={zone ? ZONE_LABELS[zone] : undefined}
              onClearArea={zone ? () => setZone(null) : undefined}
            />
          </div>
        ) : (
          <>
            <MapView
              therapists={list}
              studios={studios}
              selectedId={effectiveSelectedId}
              onSelect={setSelectedMapId}
            />
            <MapCarousel
              list={list}
              studios={studios}
              selectedId={effectiveSelectedId}
              onPick={pick}
            />
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
