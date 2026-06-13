import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/icon/Icon'
import { PhoneFrame } from '@/components/shell/PhoneFrame'

/** Recovery view shown when a profile id doesn't resolve to a therapist. */
export function TherapistNotFound() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-grey-100">
          <Icon name="search" size={26} color="var(--color-grey-500)" />
        </div>
        <div>
          <div className="font-display text-[18px] font-bold text-grey-900">
            Therapist not found
          </div>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-grey-600">
            This profile doesn&apos;t exist or is no longer available.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-candy-600 px-[18px] py-[10px] text-[14px] font-semibold text-white hover:brightness-95"
        >
          Back to directory
        </Link>
      </div>
    </PhoneFrame>
  )
}
