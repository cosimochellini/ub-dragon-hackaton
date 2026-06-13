import { useCallback, useMemo, useState } from 'react'
import { Header } from './shell/Header'
import { FloatingToggle } from './shell/FloatingToggle'
import { EmptyState } from './shell/EmptyState'
import { TherapistList } from './therapist/TherapistList'
import { MapView } from './map/MapView'
import { MapCarousel } from './MapCarousel'
import { BookingSheet } from './booking/BookingSheet'
import { filterTherapists } from '@/lib/filter'
import type {
  Booking,
  Day,
  GenderFilter,
  ServiceType,
  Studio,
  Therapist,
} from '@/lib/types'

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
}: {
  therapists: Therapist[]
  studios: Record<string, Studio>
}) {
  const [view, setView] = useState<View>('list')
  const [service, setService] = useState<ServiceType>('individual')
  const [gender, setGender] = useState<GenderFilter>('any')
  const [selectedMapId, setSelectedMapId] = useState<string | null>(
    therapists[0]?.id ?? null,
  )
  const [booking, setBooking] = useState<Booking | null>(null)
  const [booked, setBooked] = useState(false)

  const list = useMemo(
    () => filterTherapists(therapists, service, gender),
    [therapists, service, gender],
  )
  const effectiveSelectedId = effectiveSelection(list, selectedMapId)

  const pick = useCallback((t: Therapist, day: Day, slot: string) => {
    setBooked(false)
    setBooking({ t, day, slot })
  }, [])
  const confirm = useCallback(() => setBooked(true), [])
  const closeSheet = useCallback(() => {
    setBooking(null)
    setBooked(false)
  }, [])

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <Header
        service={service}
        setService={setService}
        gender={gender}
        setGender={setGender}
        count={list.length}
      />

      <div className="relative flex-1 overflow-hidden">
        {view === 'list' ? (
          list.length > 0 ? (
            <TherapistList
              key={`${service}-${gender}`}
              list={list}
              studios={studios}
              onPick={pick}
            />
          ) : (
            <EmptyState />
          )
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
