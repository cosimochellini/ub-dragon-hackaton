import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
}

/** Filter pill — grey by default, green when active (Zenit "filter" chip). */
export function Chip({ active, children, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-transparent px-[14px] py-[8px] text-[13px] font-medium leading-[1.4] transition-all duration-[120ms] ease-out ${active ? 'bg-edamame-100 text-[#082f18]' : 'bg-grey-100 text-grey-900'} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
