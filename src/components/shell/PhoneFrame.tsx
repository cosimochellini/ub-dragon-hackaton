import type { ReactNode } from 'react'

/**
 * Mobile-first shell. On phones the app fills the viewport; on wider screens it
 * centers inside a phone-sized rounded frame for the demo (no fake iOS chrome).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-grey-100 sm:p-6">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-white sm:h-[min(874px,100dvh-48px)] sm:w-[402px] sm:rounded-[44px] sm:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] sm:ring-1 sm:ring-black/5">
        {children}
      </div>
    </div>
  )
}
