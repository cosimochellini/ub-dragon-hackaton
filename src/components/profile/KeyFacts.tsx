import { Icon } from '@/components/icon/Icon'
import { Section } from './Section'
import type { IconName } from '@/components/icon/icon-paths'
import type { Therapist } from '@/lib/types'
import type { ReactNode } from 'react'

interface Fact {
  key: string
  icon: IconName
  label: ReactNode
}

function strong(value: ReactNode): ReactNode {
  return <b className="font-semibold text-grey-900">{value}</b>
}

/** The "What you should know" quick-facts list. */
export function KeyFacts({ t }: { t: Therapist }) {
  const p = t.profile
  const facts: Fact[] = [
    { key: 'age', icon: 'user', label: <>Is {strong(`${p.age}`)} years old</> },
    { key: 'city', icon: 'pin-empty', label: <>Lives in {strong(p.city)}</> },
    {
      key: 'experience',
      icon: 'clock',
      label: <>Over {strong(`${p.yearsExperience} years`)} of experience</>,
    },
    {
      key: 'people',
      icon: 'heart',
      label: (
        <>Has supported {strong(`${p.peopleHelped} people`)} on Unobravo</>
      ),
    },
    {
      key: 'orientation',
      icon: 'compass',
      label: <>Works with a {strong(p.orientation)} approach</>,
    },
    { key: 'setting', icon: 'office', label: <>Works {strong(p.setting)}</> },
  ]
  return (
    <Section title="What you should know">
      <ul className="flex flex-col gap-2.5">
        {facts.map((fact) => (
          <li
            key={fact.key}
            className="flex items-center gap-2.5 text-[13.5px] text-grey-700"
          >
            <Icon name={fact.icon} size={16} color="var(--color-candy-600)" />
            <span>{fact.label}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
