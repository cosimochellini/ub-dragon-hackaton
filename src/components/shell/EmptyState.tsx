import { Icon } from '@/components/icon/Icon'
import { Button } from '@/components/ui/Button'

/**
 * Shown when no therapist matches the current filters. When an `areaLabel` is
 * active (the onboarding area pre-filter), the copy names that area and offers
 * to widen the search, since the area filter has no visible chip to clear.
 */
export function EmptyState({
  areaLabel,
  onClearArea,
}: {
  areaLabel?: string
  onClearArea?: () => void
}) {
  const inArea = Boolean(areaLabel && onClearArea)
  return (
    <div className="px-[30px] py-12 text-center text-grey-600">
      <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-full bg-grey-100">
        <Icon name="search" size={26} color="var(--color-grey-500)" />
      </div>
      <div className="font-display text-[18px] font-bold text-grey-900">
        No therapists match
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.5]">
        {inArea
          ? `No therapists in ${areaLabel} match this selection. Try a different service or gender, or widen the area.`
          : 'Try a different service type or gender to see more in Milan.'}
      </p>
      {inArea ? (
        <Button
          variant="secondary"
          size="md"
          className="mt-4"
          onClick={onClearArea}
        >
          Show all areas
        </Button>
      ) : null}
    </div>
  )
}
