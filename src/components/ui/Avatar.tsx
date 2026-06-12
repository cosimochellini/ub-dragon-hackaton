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
  className?: string
  style?: CSSProperties
}

export function Avatar({
  initials,
  variant = 'candy8',
  size = 'md',
  className,
  style,
}: AvatarProps) {
  const px = typeof size === 'number' ? size : NAMED_SIZE[size]
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full border border-[rgba(35,35,35,0.08)] font-display font-bold ${VARIANT_CLASS[variant]} ${className ?? ''}`}
      style={{ width: px, height: px, fontSize: px * 0.36, letterSpacing: '-0.02em', ...style }}
    >
      {initials}
    </div>
  )
}
