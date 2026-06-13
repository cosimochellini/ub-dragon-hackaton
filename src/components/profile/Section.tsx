import type { ReactNode } from 'react'

/** A titled profile section: an `h2` heading above its content. */
export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-[16px] font-bold text-grey-900">
        {title}
      </h2>
      {children}
    </section>
  )
}
