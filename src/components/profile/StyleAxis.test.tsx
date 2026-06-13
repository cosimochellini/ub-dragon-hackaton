import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StyleAxis } from './StyleAxis'

describe('StyleAxis', () => {
  it('renders both ends of the axis', () => {
    render(<StyleAxis axis={{ left: 'Formal', right: 'Informal', value: 50 }} />)
    expect(screen.getByText('Formal')).toBeInTheDocument()
    expect(screen.getByText('Informal')).toBeInTheDocument()
  })

  it('describes the lean for assistive tech', () => {
    const { rerender } = render(
      <StyleAxis axis={{ left: 'Formal', right: 'Informal', value: 10 }} />,
    )
    expect(
      screen.getByRole('img', { name: 'Formal to Informal: leans formal' }),
    ).toBeInTheDocument()

    rerender(<StyleAxis axis={{ left: 'Formal', right: 'Informal', value: 90 }} />)
    expect(
      screen.getByRole('img', { name: 'Formal to Informal: leans informal' }),
    ).toBeInTheDocument()

    rerender(<StyleAxis axis={{ left: 'Formal', right: 'Informal', value: 50 }} />)
    expect(
      screen.getByRole('img', { name: 'Formal to Informal: balanced' }),
    ).toBeInTheDocument()
  })

  it('highlights exactly the segment matching the value', () => {
    const { container } = render(
      <StyleAxis axis={{ left: 'A', right: 'B', value: 50 }} />,
    )
    const track = container.querySelector('[aria-hidden="true"]')
    expect(track).not.toBeNull()
    const segments = [...track!.children]
    const activeSegments = segments.filter(
      (s) => (s as HTMLElement).dataset.active !== undefined,
    )
    expect(activeSegments).toHaveLength(1)
    // value 50 → floor(50 / 20) = 2 → the third of five segments.
    expect(segments.indexOf(activeSegments[0])).toBe(2)
  })
})
