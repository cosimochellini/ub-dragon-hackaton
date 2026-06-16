import { useCallback, useMemo, useState } from 'react'
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
  // The therapists behind the tapped map group (cluster or multi-therapist
  // studio). When set, the carousel narrows to them; `null` shows the full list.
  const [focusGroupIds, setFocusGroupIds] = useState<string[] | null>(null)
  const { booking, booked, pick, confirm, closeSheet } = useBooking()

  const list = useMemo(
    () => filterTherapists(therapists, service, gender),
    [therapists, service, gender],
  )
  const effectiveSelectedId = effectiveSelection(list, selectedMapId)

  // A map tap selects a therapist and, when the pin stands for more than one,
  // focuses the carousel on that group. A lone pin (≤1 id) clears the focus so
  // the full list returns.
  const handleSelect = useCallback(
    (id: string, groupTherapistIds?: string[]) => {
      setSelectedMapId(id)
      setFocusGroupIds(
        groupTherapistIds && groupTherapistIds.length > 1
          ? groupTherapistIds
          : null,
      )
    },
    [],
  )

  // The carousel's list: the focused group when one is set, otherwise the whole
  // filtered list. Guard against a stale focus that no longer intersects the
  // list (resets below should prevent it, but never render an empty strip).
  const focusedList = useMemo(() => {
    if (!focusGroupIds) return list
    const set = new Set(focusGroupIds)
    const sub = list.filter((t) => set.has(t.id))
    return sub.length > 0 ? sub : list
  }, [list, focusGroupIds])

  // Changing a filter (or switching to the list) abandons the group focus.
  const changeService = useCallback((s: ServiceType) => {
    setService(s)
    setFocusGroupIds(null)
  }, [])
  const changeGender = useCallback((g: GenderFilter) => {
    setGender(g)
    setFocusGroupIds(null)
  }, [])

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <Header
        service={service}
        setService={changeService}
        gender={gender}
        setGender={changeGender}
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
              onSelect={handleSelect}
            />
            {list.length > 0 ? (
              <MapCarousel
                // Remount per focus group so the strip resets to its first card
                // (and the arrow states reset) when the focus changes — no
                // syncing effect, matching the TherapistList pattern.
                key={focusGroupIds ? focusGroupIds.join('|') : 'all'}
                list={focusedList}
                studios={studios}
                selectedId={effectiveSelectedId}
                onPick={pick}
                // Drive the pill off whether the strip is actually narrowed, not
                // raw focus state — so the stale-focus fallback in `focusedList`
                // never shows a "Showing N of N" pill over an already-full list.
                focused={focusedList.length < list.length}
                totalCount={list.length}
                onShowAll={() => setFocusGroupIds(null)}
              />
            ) : null}
          </>
        )}
      </div>

      <FloatingToggle
        view={view}
        onToggle={() => {
          setView((v) => (v === 'list' ? 'map' : 'list'))
          setFocusGroupIds(null)
        }}
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
