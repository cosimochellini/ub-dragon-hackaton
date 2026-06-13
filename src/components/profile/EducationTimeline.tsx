import { Section } from './Section'
import type { EducationEntry } from '@/lib/types'

/** The "Education & training" vertical timeline (CSS dots + connector). */
export function EducationTimeline({ entries }: { entries: EducationEntry[] }) {
  const lastIndex = entries.length - 1
  return (
    <Section title="Education & training">
      <ol className="flex flex-col">
        {entries.map((entry, i) => (
          <li key={entry.detail} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-candy-600"
                aria-hidden={true}
              />
              {i < lastIndex ? (
                <span
                  className="my-1 w-px flex-1 bg-grey-200"
                  aria-hidden={true}
                />
              ) : null}
            </div>
            <div className={`min-w-0 ${i < lastIndex ? 'pb-4' : ''}`}>
              <div className="text-[13px] font-semibold text-grey-900">
                {entry.title}
              </div>
              <div className="mt-0.5 text-[12.5px] leading-[1.45] text-grey-600">
                {entry.detail}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
