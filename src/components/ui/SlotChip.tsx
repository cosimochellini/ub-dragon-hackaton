import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface SlotChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  children: ReactNode
}

/** Time-slot pill — outlined, candy when selected. */
export function SlotChip({
  selected,
  children,
  className,
  type = 'button',
  ...rest
}: SlotChipProps) {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-full px-[12px] py-[9px] text-[13px] font-semibold leading-none transition-all duration-[120ms] ease-out ${selected ? 'border-[1.5px] border-candy-600 bg-candy-50 text-candy-700' : 'border border-grey-300 bg-white text-grey-900 hover:bg-grey-100'} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
