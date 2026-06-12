import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'success'
type Size = 'md' | 'lg'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-candy-600 text-white hover:brightness-95',
  secondary:
    'bg-white text-grey-900 shadow-[inset_0_0_0_1px_var(--color-grey-300)] hover:bg-grey-100',
  tertiary: 'bg-transparent text-grey-900 hover:bg-black/5',
  success: 'bg-edamame-600 text-white hover:brightness-95',
}

const SIZE_CLASS: Record<Size, string> = {
  md: 'px-[18px] py-[10px] text-[14px]',
  lg: 'px-[22px] py-[14px] text-[15px]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  iconLeft?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  iconLeft,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-0 font-body font-semibold transition-all duration-150 ease-out ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${full ? 'w-full' : ''} ${disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'} ${className ?? ''}`}
      {...rest}
    >
      {iconLeft}
      {children}
    </button>
  )
}
