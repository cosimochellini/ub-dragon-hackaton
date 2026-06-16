import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Therapist } from '@/lib/types'

/** Identity block: avatar, name, headline, register line and quick badges. */
export function ProfileHeader({ t }: { t: Therapist }) {
  const { profile } = t
  return (
    <div className="flex flex-col items-start gap-3">
      <Avatar
        initials={t.initials}
        variant={t.avatar}
        imageUrl={t.photoUrl}
        size="xl"
      />
      <div>
        <h1 className="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.01em] text-grey-900">
          {t.name}
        </h1>
        <p className="mt-1 text-[13px] text-grey-600">{profile.headline}</p>
        <p className="mt-0.5 text-[12px] text-grey-500">
          Registered psychologist · {profile.alboRegion} no.{' '}
          {profile.alboNumber}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Badge variant="accent">{profile.yearsExperience}+ years</Badge>
          <Badge>{profile.alboRegion}</Badge>
        </div>
      </div>
    </div>
  )
}
