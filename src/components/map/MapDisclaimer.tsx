import { Icon } from '@/components/icon/Icon'

/**
 * Bottom-center pill noting that studio pins are approximate. Shared by the
 * stylized SVG map and the Leaflet map so both read identically.
 */
export function MapDisclaimer() {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex justify-center">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-[7px] text-[11.5px] font-medium text-grey-700 shadow-sm backdrop-blur-md">
        <Icon name="pin-empty" size={14} color="var(--color-candy-600)" />
        Approximate areas — exact address after booking
      </div>
    </div>
  )
}
