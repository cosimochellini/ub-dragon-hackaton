import { useState } from 'react'
import type { AvatarVariant } from '@/lib/types'
import type { CSSProperties } from 'react'

const VARIANT_CLASS: Record<AvatarVariant, string> = {
  candy8: 'bg-candy-800 text-cream',
  candy4: 'bg-candy-400 text-white',
  smurf: 'bg-smurf-700 text-white',
  grey: 'bg-grey-300 text-grey-800',
}

const NAMED_SIZE = { sm: 32, md: 40, lg: 48, xl: 64 } as const
export type AvatarSize = keyof typeof NAMED_SIZE | number

interface AvatarProps {
  initials: string
  variant?: AvatarVariant
  size?: AvatarSize
  /** Real profile photo; falls back to the initials avatar if missing/broken. */
  imageUrl?: string
  className?: string
  style?: CSSProperties
}

export function Avatar({
  initials,
  variant = 'candy8',
  size = 'md',
  imageUrl,
  className,
  style,
}: AvatarProps) {
  const px = typeof size === 'number' ? size : NAMED_SIZE[size]
  // The photo can 404 (S3) — fall back to the initials avatar on load error.
  // Track the failed URL (not a boolean) so the latch resets automatically if
  // the same Avatar instance is later reused with a different `imageUrl`.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (imageUrl && failedUrl !== imageUrl) {
    return (
      <img
        // Decorative: the therapist's name is always shown alongside the avatar.
        alt=""
        src={imageUrl}
        loading="lazy"
        onError={() => setFailedUrl(imageUrl)}
        className={`shrink-0 rounded-full border border-[rgba(35,35,35,0.08)] object-cover ${className ?? ''}`}
        style={{ width: px, height: px, ...style }}
      />
    )
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full border border-[rgba(35,35,35,0.08)] font-display font-bold ${VARIANT_CLASS[variant]} ${className ?? ''}`}
      style={{
        width: px,
        height: px,
        fontSize: px * 0.36,
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      {initials}
    </div>
  )
}
