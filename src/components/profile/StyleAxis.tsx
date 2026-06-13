import type { StyleAxis as StyleAxisData } from '@/lib/types'

// Stable keys for the 5 track segments (not derived from the map index, so the
// no-array-index-key lint rule stays satisfied).
const SEGMENT_KEYS = ['s1', 's2', 's3', 's4', 's5']
const CENTER_INDEX = (SEGMENT_KEYS.length - 1) / 2

// Describe the lean from the *highlighted segment*, so the screen-reader label
// and the visual always agree (the two must never use independent thresholds).
function leanLabel(axis: StyleAxisData, activeIndex: number): string {
  if (activeIndex < CENTER_INDEX) return `leans ${axis.left.toLowerCase()}`
  if (activeIndex > CENTER_INDEX) return `leans ${axis.right.toLowerCase()}`
  return 'balanced'
}

/**
 * One personality/session axis (e.g. Formal ←→ Informal) rendered as a labelled
 * 5-segment track with the active segment highlighted. Non-interactive; exposed
 * to assistive tech as a single image with a descriptive label.
 */
export function StyleAxis({ axis }: { axis: StyleAxisData }) {
  const activeIndex = Math.min(
    SEGMENT_KEYS.length - 1,
    Math.floor(axis.value / 20),
  )
  return (
    <div
      role="img"
      aria-label={`${axis.left} to ${axis.right}: ${leanLabel(axis, activeIndex)}`}
    >
      <div className="flex items-center justify-between text-[12px] font-medium text-grey-600">
        <span>{axis.left}</span>
        <span>{axis.right}</span>
      </div>
      <div className="mt-1.5 flex gap-1" aria-hidden={true}>
        {SEGMENT_KEYS.map((segKey, i) => (
          <span
            key={segKey}
            data-active={i === activeIndex ? '' : undefined}
            className={`h-[5px] flex-1 rounded-full ${
              i === activeIndex ? 'bg-candy-600' : 'bg-grey-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
