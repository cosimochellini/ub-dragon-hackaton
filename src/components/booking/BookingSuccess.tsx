import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icon/Icon'
import type { IconName } from '@/components/icon/icon-paths'
import { studioOf } from '@/lib/studios'
import type { Day, Studio, Therapist } from '@/lib/types'

function Row({
  icon,
  label,
  last,
}: {
  icon: IconName
  label: string
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2.5 py-2 ${last ? '' : 'border-b border-grey-200'}`}
    >
      <Icon name={icon} size={16} color="var(--color-grey-600)" />
      <span className="text-[13px] font-medium text-grey-800">{label}</span>
    </div>
  )
}

export function BookingSuccess({
  t,
  day,
  slot,
  studios,
  onClose,
}: {
  t: Therapist
  day: Day
  slot: string
  studios: Record<string, Studio>
  onClose: () => void
}) {
  const studio = studioOf(t, studios)
  return (
    <div className="pt-1 text-center">
      <div className="mx-auto mb-3.5 grid h-16 w-16 place-items-center rounded-full bg-edamame-50">
        <Icon
          name="check-in-circle"
          size={34}
          color="var(--color-edamame-600)"
        />
      </div>
      <div
        id="booking-sheet-title"
        className="font-display text-[22px] font-bold leading-[1.1] text-grey-900"
      >
        You&apos;re booked
      </div>
      <p className="mx-3 mt-2 mb-[18px] text-[13.5px] leading-[1.5] text-grey-700">
        Your free intro call with {t.name} is set. We&apos;ve sent the studio
        address and a calendar invite by message.
      </p>
      <div className="mb-[18px] rounded-[16px] bg-grey-50 p-3.5 text-left">
        <Row icon="calendar" label={`${day.dateLabel} · ${slot}`} />
        <Row
          icon={studio?.type === 'unobravo' ? 'office' : 'pin-empty'}
          label={
            studio
              ? `${studio.name} · ${studio.area}, Milan`
              : 'Studio in Milan'
          }
        />
        <Row icon="clock" label="50-minute introductory call" last />
      </div>
      <Button variant="primary" size="lg" full onClick={onClose}>
        Done
      </Button>
    </div>
  )
}
