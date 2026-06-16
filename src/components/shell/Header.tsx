import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/icon/Icon'
import type { GenderFilter, ServiceType } from '@/lib/types'

const SERVICES: Array<[ServiceType, string]> = [
  ['individual', 'Individual'],
  ['couples', 'Couples'],
]
const GENDERS: Array<[GenderFilter, string]> = [
  ['any', 'Any'],
  ['female', 'Female'],
  ['male', 'Male'],
]

export function Header({
  service,
  setService,
  gender,
  setGender,
  count,
  onEditPreferences,
}: {
  service: ServiceType
  setService: (s: ServiceType) => void
  gender: GenderFilter
  setGender: (g: GenderFilter) => void
  count: number
  /** When provided, shows an "Edit preferences" control to re-run onboarding. */
  onEditPreferences?: () => void
}) {
  return (
    <div className="z-[6] flex-none border-b border-grey-200 bg-white pt-[max(14px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between px-[18px] pt-1.5">
        <img
          src="/logo-unobravo-black.svg"
          alt="Unobravo"
          className="block h-[15px]"
        />
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-grey-600">
            <Icon name="pin-filled" size={14} color="var(--color-candy-600)" />
            Milan
          </div>
          {onEditPreferences ? (
            <button
              type="button"
              onClick={onEditPreferences}
              className="cursor-pointer rounded-full px-2 py-1 text-[11.5px] font-semibold text-candy-600 transition-colors hover:bg-candy-50"
            >
              Edit preferences
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-[18px] pt-2.5 pb-1">
        <h1 className="font-display text-[23px] font-bold leading-[1.1] tracking-[-0.015em] text-grey-900">
          Therapists in Milan
        </h1>
        <div className="mt-[3px] text-[13px] text-grey-600">
          Book a free intro call, in person.
        </div>
      </div>

      <div className="flex flex-col gap-[9px] px-[18px] pt-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-[52px] shrink-0 text-[12px] font-semibold text-grey-600">
            Service
          </span>
          {SERVICES.map(([value, label]) => (
            <Chip
              key={value}
              active={service === value}
              onClick={() => setService(value)}
            >
              {label}
            </Chip>
          ))}
          <span
            aria-live="polite"
            className="ml-auto whitespace-nowrap text-[12px] font-medium text-grey-500"
          >
            {count} found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-[52px] shrink-0 text-[12px] font-semibold text-grey-600">
            Gender
          </span>
          {GENDERS.map(([value, label]) => (
            <Chip
              key={value}
              active={gender === value}
              onClick={() => setGender(value)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
