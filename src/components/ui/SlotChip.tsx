import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface SlotChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/** Time-slot pill — outlined; tapping books the slot. */
export function SlotChip({
  children,
  className,
  type = 'button',
  ...rest
}: SlotChipProps) {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-full border border-grey-300 bg-white px-[12px] py-[9px] text-[13px] font-semibold leading-none text-grey-900 transition-all duration-[120ms] ease-out hover:bg-grey-100 ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
