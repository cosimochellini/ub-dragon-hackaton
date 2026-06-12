import { ICON_PATHS } from './icon-paths'
import type { IconName } from './icon-paths'
import type { CSSProperties } from 'react'

interface IconProps {
  name: IconName
  size?: number
  /** Sets `currentColor` for the glyph. */
  color?: string
  /** Accessible label; when set the icon is exposed as an image, else hidden. */
  title?: string
  className?: string
  style?: CSSProperties
}

export function Icon({ name, size = 16, color, title, className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={className}
      style={{ display: 'block', flexShrink: 0, color, ...style }}
    >
      {title ? <title>{title}</title> : null}
      {ICON_PATHS[name].map((p, i) =>
        p.filled ? (
          <path key={i} d={p.d} fill="currentColor" />
        ) : (
          <path
            key={i}
            d={p.d}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  )
}
