import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import type { ReactNode } from 'react'
import type { QuestionDef } from './questions'

/**
 * Chrome for a single questionnaire screen: progress bar, numbered title,
 * description, the answer control (passed as children), and the Back/Ok footer.
 * "Ok" (or Enter inside a field) advances via `onNext`.
 */
export function QuestionShell({
  index,
  total,
  question,
  canGoBack,
  canAdvance,
  onBack,
  onNext,
  children,
}: {
  index: number
  total: number
  question: QuestionDef
  canGoBack: boolean
  canAdvance: boolean
  onBack: () => void
  onNext: () => void
  children: ReactNode
}) {
  const pct = Math.round(((index + 1) / total) * 100)
  const titleId = `onboarding-q-${question.id}`

  // Move focus to the new question's heading on each step change so keyboard and
  // screen-reader users follow the flow and hear the new question announced.
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [question.id])

  return (
    <div className="flex h-full flex-col bg-cream">
      <div
        className="h-1 w-full shrink-0 bg-candy-900/10"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${index + 1} of ${total}`}
      >
        <div
          className="h-full bg-candy-600 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="no-sb flex-1 overflow-y-auto px-6 pt-7 pb-8">
        <div className="mb-4 flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-candy-900 text-[13px] font-bold text-white">
            {index + 1}
          </span>
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[22px] font-bold leading-[1.18] tracking-[-0.01em] text-grey-900 outline-none"
          >
            {question.title}
            {question.required ? (
              <span className="text-candy-600"> *</span>
            ) : null}
          </h2>
        </div>

        {question.description ? (
          <p className="mb-1 whitespace-pre-line text-[14px] leading-[1.5] text-grey-600">
            {question.description}
          </p>
        ) : null}

        <div className="mt-5" aria-labelledby={titleId} role="group">
          {children}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {canGoBack ? (
            <Button variant="tertiary" onClick={onBack}>
              Back
            </Button>
          ) : null}
          <Button variant="primary" disabled={!canAdvance} onClick={onNext}>
            Ok
          </Button>
        </div>
      </div>
    </div>
  )
}
