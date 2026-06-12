import { Icon } from '@/components/icon/Icon'

export function EmptyState() {
  return (
    <div className="px-[30px] py-12 text-center text-grey-600">
      <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-full bg-grey-100">
        <Icon name="search" size={26} color="var(--color-grey-500)" />
      </div>
      <div className="font-display text-[18px] font-bold text-grey-900">
        No therapists match
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.5]">
        Try a different service type or gender to see more in Milan.
      </p>
    </div>
  )
}
