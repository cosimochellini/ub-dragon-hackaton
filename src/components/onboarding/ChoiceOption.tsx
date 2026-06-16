/** Letter for an option index: 0 → "A", 1 → "B", … */
export function optionLetter(index: number): string {
  return String.fromCodePoint(65 + index)
}

/**
 * A selectable option row, reused for single- and multi-choice questions. Uses
 * the codebase's button + `aria-pressed` convention (as in `Chip`/`DayStrip`)
 * rather than native radios/checkboxes, so it stays visually coherent.
 */
export function ChoiceOption({
  index,
  label,
  selected,
  onSelect,
}: {
  index: number
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-[15px] leading-[1.35] text-candy-800 transition-colors duration-[120ms] ease-out ${
        selected
          ? 'bg-candy-50 ring-2 ring-candy-700'
          : 'bg-candy-900/[0.05] hover:bg-candy-900/[0.09]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
          selected
            ? 'bg-candy-700 text-white'
            : 'border border-candy-700/40 text-candy-700'
        }`}
      >
        {optionLetter(index)}
      </span>
      <span>{label}</span>
    </button>
  )
}
