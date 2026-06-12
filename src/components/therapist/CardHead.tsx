import { Avatar } from '@/components/ui/Avatar'
import type { ServiceType, Therapist } from '@/lib/types'

const SERVICE_LABEL: Record<ServiceType, string> = {
  individual: 'Individual',
  couples: 'Couples',
}

function servicesLine(t: Therapist): string {
  const services = t.services.map((s) => SERVICE_LABEL[s]).join(' & ')
  return `${services} · In person`
}

export function CardHead({ t }: { t: Therapist }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar initials={t.initials} variant={t.avatar} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[17px] font-bold leading-[1.15] tracking-[-0.01em] text-grey-900">
          {t.name}
        </div>
        <div className="mt-0.5 text-[12.5px] text-grey-600">{t.title}</div>
        <div className="mt-[5px] text-[12px] text-grey-600">{servicesLine(t)}</div>
      </div>
    </div>
  )
}
