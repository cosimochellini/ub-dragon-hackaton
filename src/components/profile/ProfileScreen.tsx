import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/icon/Icon'
import { BookingSheet } from '@/components/booking/BookingSheet'
import { useBooking } from '@/hooks/useBooking'
import { ProfileHeader } from './ProfileHeader'
import { BookingPanel } from './BookingPanel'
import { KeyFacts } from './KeyFacts'
import { TopicList } from './TopicList'
import { StyleGroup } from './StyleGroup'
import { EducationTimeline } from './EducationTimeline'
import { Section } from './Section'
import type { Studio, Therapist } from '@/lib/types'

/**
 * The therapist profile screen. Mirrors `MilanApp`'s layout shell (a `relative`
 * full-height column) so the shared `BookingSheet` overlay anchors to the phone
 * frame, with a scrollable content column in between.
 */
export function ProfileScreen({
  therapist,
  studios,
}: {
  therapist: Therapist
  studios: Record<string, Studio>
}) {
  const { booking, booked, pick, confirm, closeSheet } = useBooking()
  const { profile } = therapist

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-grey-200 px-3 py-3">
        <Link
          to="/"
          aria-label="Back to directory"
          className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-100"
        >
          <Icon name="arrow-left" size={20} />
        </Link>
        <span className="font-display text-[15px] font-bold text-grey-900">
          Profile
        </span>
      </div>

      <div className="no-sb flex-1 overflow-y-auto px-[18px] pt-4 pb-[40px]">
        <ProfileHeader t={therapist} />
        <div className="mt-5">
          <BookingPanel t={therapist} onPick={pick} />
        </div>
        <KeyFacts t={therapist} />
        <TopicList topics={profile.topics} />
        <StyleGroup title="Their style" axes={profile.styleAxes} />
        <StyleGroup title="During sessions" axes={profile.sessionAxes} />
        <Section title="How they describe themselves">
          <p className="text-[13.5px] leading-[1.6] text-grey-700">
            {profile.bio}
          </p>
        </Section>
        <EducationTimeline entries={profile.education} />
      </div>

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
