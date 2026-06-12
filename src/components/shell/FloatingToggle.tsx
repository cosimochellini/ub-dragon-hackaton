import { Icon } from '@/components/icon/Icon'

export function FloatingToggle({
  view,
  onToggle,
}: {
  view: 'list' | 'map'
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute bottom-[46px] left-1/2 z-40 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full border-0 bg-grey-900 px-5 py-3 font-body text-[14px] font-semibold text-white shadow-md"
    >
      <Icon name={view === 'list' ? 'compass' : 'unordered-list'} size={18} color="#fff" />
      {view === 'list' ? 'Map' : 'List'}
    </button>
  )
}
