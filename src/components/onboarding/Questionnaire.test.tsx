import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Questionnaire } from './Questionnaire'
import type { OnboardingAnswers } from '@/lib/onboarding'

function ok() {
  return screen.getByRole('button', { name: 'Ok' })
}

describe('Questionnaire', () => {
  it('gates "Ok" until the first (required) question is answered', async () => {
    const user = userEvent.setup()
    render(<Questionnaire onComplete={vi.fn()} />)

    expect(
      screen.getByText('Which path are you interested in?'),
    ).toBeInTheDocument()
    expect(ok()).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Individual' }))
    expect(ok()).toBeEnabled()
  })

  it('treats "None of these" as mutually exclusive on the multi-select', async () => {
    const user = userEvent.setup()
    render(<Questionnaire onComplete={vi.fn()} />)

    // Advance to the reasons (multi-select) question.
    await user.click(screen.getByRole('button', { name: 'Individual' }))
    await user.click(ok())
    await user.type(screen.getByRole('spinbutton'), '28')
    await user.click(ok())

    const anxiety = screen.getByRole('button', {
      name: 'I often feel anxious or stressed',
    })
    const none = screen.getByRole('button', { name: 'None of these' })

    await user.click(anxiety)
    expect(anxiety).toHaveAttribute('aria-pressed', 'true')

    // Picking "None of these" clears the others…
    await user.click(none)
    expect(none).toHaveAttribute('aria-pressed', 'true')
    expect(anxiety).toHaveAttribute('aria-pressed', 'false')

    // …and picking another option clears "None of these".
    await user.click(anxiety)
    expect(anxiety).toHaveAttribute('aria-pressed', 'true')
    expect(none).toHaveAttribute('aria-pressed', 'false')
  })

  it('rejects a non-integer age', async () => {
    const user = userEvent.setup()
    render(<Questionnaire onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Individual' }))
    await user.click(ok())

    const age = screen.getByRole('spinbutton')
    await user.type(age, '12.5')
    expect(ok()).toBeDisabled()
  })

  it('walks every step and reports the assembled answers', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn<(a: OnboardingAnswers) => void>()
    render(<Questionnaire onComplete={onComplete} />)

    // 1 path
    await user.click(screen.getByRole('button', { name: 'Individual' }))
    await user.click(ok())
    // 2 age
    await user.type(screen.getByRole('spinbutton'), '28')
    await user.click(ok())
    // 3 reasons
    await user.click(
      screen.getByRole('button', { name: 'I often feel anxious or stressed' }),
    )
    await user.click(ok())
    // 4 more (optional — skip)
    expect(ok()).toBeEnabled()
    await user.click(ok())
    // 5 duration
    await user.click(screen.getByRole('button', { name: 'At least a year' }))
    await user.click(ok())
    // 6 prior therapy (optional)
    await user.click(
      screen.getByRole('button', { name: 'No, this is the first time' }),
    )
    await user.click(ok())
    // 7 city
    await user.click(screen.getByRole('button', { name: 'Milan' }))
    await user.click(ok())
    // 8 gender preference
    await user.click(screen.getByRole('button', { name: 'Woman' }))
    await user.click(ok())

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      path: 'individual',
      age: 28,
      reasons: ['anxiety'],
      more: undefined,
      duration: 'one_year',
      priorTherapy: 'first',
      city: 'milan',
      genderPref: 'female',
    })
  })

  it('lets you go Back to a previous answer', async () => {
    const user = userEvent.setup()
    render(<Questionnaire onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Individual' }))
    await user.click(ok())
    expect(screen.getByText('How old are you?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(
      screen.getByText('Which path are you interested in?'),
    ).toBeInTheDocument()
    // The earlier answer is preserved.
    expect(screen.getByRole('button', { name: 'Individual' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
