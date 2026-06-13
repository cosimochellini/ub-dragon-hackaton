import { useCallback, useState } from 'react'
import type { Booking, Day, Therapist } from '@/lib/types'

export interface UseBooking {
  /** The slot currently being booked, or null when the sheet is closed. */
  booking: Booking | null
  /** Whether the in-progress booking has been confirmed. */
  booked: boolean
  /** Open the booking sheet for a therapist's slot. */
  pick: (t: Therapist, day: Day, slot: string) => void
  /** Mark the current booking as confirmed (shows the success state). */
  confirm: () => void
  /** Close the sheet and reset the flow. */
  closeSheet: () => void
}

/**
 * Transient booking state for the directory and the profile page: which slot
 * is being booked and whether it has been confirmed. Shared so both surfaces
 * drive the same `BookingSheet` with identical behavior.
 */
export function useBooking(): UseBooking {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [booked, setBooked] = useState(false)

  const pick = useCallback((t: Therapist, day: Day, slot: string) => {
    setBooked(false)
    setBooking({ t, day, slot })
  }, [])
  const confirm = useCallback(() => setBooked(true), [])
  const closeSheet = useCallback(() => {
    setBooking(null)
    setBooked(false)
  }, [])

  return { booking, booked, pick, confirm, closeSheet }
}
