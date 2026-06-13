import type { ReactNode } from 'react'

type Variant = 'accent' | 'neutral'

const VARIANT_CLASS: Record<Variant, string> = {
  accent: 'bg-candy-50 text-candy-700',
  neutral: 'bg-grey-100 text-grey-700',
}

/**
 * Small non-interactive pill (e.g. "8+ years", "Lombardy"). Distinct from
 * `Chip`, which is a clickable filter `<button>`.
 */
export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: Variant
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[10px] py-[4px] text-[12px] font-semibold leading-[1.3] ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </span>
  )
}
