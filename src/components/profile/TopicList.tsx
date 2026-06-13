import { Section } from './Section'

/** The "Often works with" box: specialization topics as a bulleted grid. */
export function TopicList({ topics }: { topics: string[] }) {
  return (
    <Section title="Often works with">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-[18px] bg-grey-50 p-4">
        {topics.map((topic) => (
          <li
            key={topic}
            className="flex items-start gap-2 text-[13px] text-grey-800"
          >
            <span
              className="mt-[6px] h-[5px] w-[5px] shrink-0 rounded-full bg-candy-500"
              aria-hidden={true}
            />
            {topic}
          </li>
        ))}
      </ul>
    </Section>
  )
}
