import { useState } from 'react'
import { QuestionShell } from './QuestionShell'
import { ChoiceOption } from './ChoiceOption'
import { QUESTIONS } from './questions'
import type { QuestionDef } from './questions'
import type {
  CityChoice,
  DurationChoice,
  GenderPrefChoice,
  OnboardingAnswers,
  PathChoice,
  PriorTherapyChoice,
  ReasonChoice,
  Zone,
} from '@/lib/onboarding'

type Draft = Record<string, unknown>

const inputClass =
  'w-full border-0 border-b-2 border-candy-800 bg-transparent py-2 text-[18px] text-candy-900 caret-candy-600 outline-none placeholder:text-candy-900/40 focus:border-candy-600'

/** Whether the current question's value satisfies its (optional) requirement. */
function isStepValid(q: QuestionDef, value: unknown): boolean {
  switch (q.type) {
    case 'single': {
      return q.required ? typeof value === 'string' && value.length > 0 : true
    }
    case 'multi': {
      return q.required ? Array.isArray(value) && value.length > 0 : true
    }
    case 'number': {
      if (typeof value !== 'string' || value.trim() === '') return !q.required
      const n = Number(value)
      if (!Number.isInteger(n)) return false
      if (q.min !== undefined && n < q.min) return false
      if (q.max !== undefined && n > q.max) return false
      return true
    }
    case 'text': {
      return q.required
        ? typeof value === 'string' && value.trim().length > 0
        : true
    }
  }
}

/** Toggle a multi-select id, treating `none` as mutually exclusive. */
function toggleMulti(current: string[], id: string): string[] {
  if (id === 'none') return current.includes('none') ? [] : ['none']
  const rest = current.filter((x) => x !== 'none')
  return rest.includes(id)
    ? rest.filter((x) => x !== id)
    : [...rest, id]
}

function assembleAnswers(draft: Draft): OnboardingAnswers {
  const more = typeof draft.more === 'string' ? draft.more.trim() : ''
  const prior =
    typeof draft.priorTherapy === 'string' && draft.priorTherapy
      ? (draft.priorTherapy as PriorTherapyChoice)
      : undefined
  return {
    path: draft.path as PathChoice,
    age: Number.parseInt(String(draft.age), 10),
    reasons: (draft.reasons as ReasonChoice[] | undefined) ?? [],
    more: more || undefined,
    duration: draft.duration as DurationChoice,
    priorTherapy: prior,
    city: draft.city as CityChoice,
    zone: draft.zone as Zone,
    genderPref: draft.genderPref as GenderPrefChoice,
  }
}

function Control({
  question,
  value,
  onChange,
  onSubmit,
}: {
  question: QuestionDef
  value: unknown
  onChange: (v: unknown) => void
  onSubmit: () => void
}) {
  switch (question.type) {
    case 'single': {
      return (
        <div className="flex flex-col gap-2.5">
          {question.options?.map((opt, i) => (
            <ChoiceOption
              key={opt.id}
              index={i}
              label={opt.label}
              selected={value === opt.id}
              onSelect={() => onChange(opt.id)}
            />
          ))}
        </div>
      )
    }
    case 'multi': {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="flex flex-col gap-2.5">
          {question.options?.map((opt, i) => (
            <ChoiceOption
              key={opt.id}
              index={i}
              label={opt.label}
              selected={selected.includes(opt.id)}
              onSelect={() => onChange(toggleMulti(selected, opt.id))}
            />
          ))}
        </div>
      )
    }
    case 'number': {
      return (
        <input
          type="number"
          inputMode="numeric"
          min={question.min}
          max={question.max}
          placeholder={question.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit()
            }
          }}
          className={inputClass}
          aria-label={question.title}
        />
      )
    }
    case 'text': {
      return (
        <div>
          <textarea
            rows={3}
            placeholder={question.placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit()
              }
            }}
            className={`${inputClass} resize-none`}
            aria-label={question.title}
          />
          <p className="mt-2 text-[12px] text-grey-500">
            Press <span className="font-semibold">Shift + Enter</span> for a new
            line.
          </p>
        </div>
      )
    }
  }
}

/**
 * The onboarding wizard: one question per screen, validation gating "Ok", a
 * Back button, and a progress bar. Calls `onComplete` with the assembled
 * answers when the last question is confirmed.
 */
export function Questionnaire({
  onComplete,
}: {
  onComplete: (answers: OnboardingAnswers) => void
}) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({ reasons: [] })

  const question = QUESTIONS[step]
  const value = draft[question.id]
  const valid = isStepValid(question, value)
  const isLast = step === QUESTIONS.length - 1

  function setValue(v: unknown) {
    setDraft((d) => ({ ...d, [question.id]: v }))
  }

  function next() {
    if (!valid) return
    if (isLast) onComplete(assembleAnswers(draft))
    else setStep((s) => s + 1)
  }

  return (
    <QuestionShell
      index={step}
      total={QUESTIONS.length}
      question={question}
      canGoBack={step > 0}
      canAdvance={valid}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={next}
    >
      <Control
        // Remount the control per step so no stale DOM (focus/scroll/uncontrolled
        // state) leaks between questions.
        key={question.id}
        question={question}
        value={value}
        onChange={setValue}
        onSubmit={next}
      />
    </QuestionShell>
  )
}
