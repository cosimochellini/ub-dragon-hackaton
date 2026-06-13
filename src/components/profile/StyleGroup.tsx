import { Section } from './Section'
import { StyleAxis } from './StyleAxis'
import type { StyleAxis as StyleAxisData } from '@/lib/types'

/** A titled group of style axes ("Their style", "During sessions"). */
export function StyleGroup({
  title,
  axes,
}: {
  title: string
  axes: StyleAxisData[]
}) {
  return (
    <Section title={title}>
      <div className="flex flex-col gap-4">
        {axes.map((axis) => (
          <StyleAxis key={axis.left} axis={axis} />
        ))}
      </div>
    </Section>
  )
}
