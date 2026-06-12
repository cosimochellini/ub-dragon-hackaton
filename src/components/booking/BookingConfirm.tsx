import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SlotSummary } from './SlotSummary'
import type { Day, Studio, Therapist } from '@/lib/types'

export function BookingConfirm({
  t,
  day,
  slot,
  studios,
  onConfirm,
  onClose,
}: {
  t: Therapist
  day: Day
  slot: string
  studios: Record<string, Studio>
  onConfirm: () => void
  onClose: () => void
}) {
  const [phone, setPhone] = useState('')
  const phoneValid = phone.replace(/\D/g, '').length >= 8

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Avatar initials={t.initials} variant={t.avatar} size="md" />
        <div>
          <div
            id="booking-sheet-title"
            className="font-display text-[19px] font-bold leading-[1.1] text-grey-900"
          >
            Book a free intro call
          </div>
          <div className="mt-0.5 text-[12.5px] text-grey-600">
            with {t.name} · {t.title}
          </div>
        </div>
      </div>

      <SlotSummary t={t} day={day} slot={slot} studios={studios} />

      <p className="mx-0.5 mt-[14px] mb-4 text-[13px] leading-[1.5] text-grey-700">
        A free 50-minute introductory call to see if it&apos;s a good fit. The
        exact studio address is shared by message once your booking is confirmed.
      </p>

      <label
        htmlFor="booking-phone"
        className="mb-1.5 block text-[13px] font-semibold text-grey-900"
      >
        Mobile number
      </label>
      <input
        id="booking-phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+39 340 000 0012"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="mb-1.5 w-full rounded-xl border border-grey-300 px-[14px] py-3 font-body text-[15px] text-grey-900 outline-none placeholder:text-grey-400 focus:border-candy-600"
      />
      <div className="mb-[18px] text-[12px] text-grey-600">
        We&apos;ll text you a reminder before the call.
      </div>

      <Button
        variant="primary"
        size="lg"
        full
        disabled={!phoneValid}
        onClick={onConfirm}
      >
        Confirm booking
      </Button>
      <Button variant="tertiary" size="md" full onClick={onClose} className="mt-1.5">
        Cancel
      </Button>
    </div>
  )
}
