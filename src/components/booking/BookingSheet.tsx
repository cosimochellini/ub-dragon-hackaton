import { useEffect, useRef } from 'react'
import { BookingConfirm } from './BookingConfirm'
import { BookingSuccess } from './BookingSuccess'
import type { Booking, Studio } from '@/lib/types'

export function BookingSheet({
  booking,
  booked,
  studios,
  onClose,
  onConfirm,
}: {
  booking: Booking | null
  booked: boolean
  studios: Record<string, Studio>
  onClose: () => void
  onConfirm: () => void
}) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const isOpen = booking !== null

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    sheetRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Trap focus inside the dialog (aria-modal contract).
      const sheet = sheetRef.current
      if (!sheet) return
      const focusable = sheet.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) {
        e.preventDefault()
        sheet.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || active === sheet) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused.current?.focus()
    }
  }, [isOpen, onClose])

  // When the sheet swaps confirm <-> success content, the focused control
  // unmounts; pull focus back into the dialog so the trap keeps working.
  useEffect(() => {
    if (isOpen) sheetRef.current?.focus()
  }, [booked, isOpen])

  if (!booking) return null
  const { t, day, slot } = booking

  return (
    <div className="absolute inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close booking"
        onClick={onClose}
        className="absolute inset-0 cursor-default border-0 bg-black/40"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-sheet-title"
        tabIndex={-1}
        className="animate-sheet absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pt-3 pb-[30px] shadow-[var(--shadow-bottom)] outline-none"
      >
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-full bg-grey-300" />
        {booked ? (
          <BookingSuccess
            t={t}
            day={day}
            slot={slot}
            studios={studios}
            onClose={onClose}
          />
        ) : (
          <BookingConfirm
            t={t}
            day={day}
            slot={slot}
            studios={studios}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
