import type { OnboardingAnswers } from '@/lib/onboarding'

export type QuestionType = 'single' | 'multi' | 'number' | 'text'

export interface QuestionOption {
  id: string
  label: string
}

export interface QuestionDef {
  /** Maps 1:1 onto a key of `OnboardingAnswers`. */
  id: keyof OnboardingAnswers
  type: QuestionType
  title: string
  description?: string
  required: boolean
  /** Present for `single` / `multi`. */
  options?: QuestionOption[]
  /** Placeholder for `number` / `text`. */
  placeholder?: string
  min?: number
  max?: number
}

/**
 * The onboarding flow, one entry per screen. English to match the rest of the
 * app. The order here is the order shown to the user.
 */
export const QUESTIONS: QuestionDef[] = [
  {
    id: 'path',
    type: 'single',
    required: true,
    title: 'Which path are you interested in?',
    description:
      'Tell us who will take part in the sessions with the Unobravo professional:\n• Individual: only you take part\n• Couples: the two of you take part\n• For a minor: your child will attend the session',
    options: [
      { id: 'individual', label: 'Individual' },
      { id: 'couples', label: 'Couples' },
      { id: 'minor', label: 'For a minor' },
    ],
  },
  {
    id: 'age',
    type: 'number',
    required: true,
    title: 'How old are you?',
    placeholder: 'Type your answer…',
    min: 1,
    max: 120,
  },
  {
    id: 'reasons',
    type: 'multi',
    required: true,
    title: 'What brings you here today?',
    description: 'You can select more than one answer.',
    options: [
      { id: 'anxiety', label: 'I often feel anxious or stressed' },
      { id: 'sadness', label: 'I often feel sad or low' },
      { id: 'work', label: "I'm having problems at work" },
      {
        id: 'relationships',
        label:
          "I feel my relationships aren't serene (partner, family, or friends)",
      },
      { id: 'growth', label: 'I want to grow as a person' },
      { id: 'none', label: 'None of these' },
    ],
  },
  {
    id: 'more',
    type: 'text',
    required: false,
    title: 'Would you like to tell us more?',
    description:
      'The information you share will only be seen by the therapist who follows you.',
    placeholder: 'Type your answer…',
  },
  {
    id: 'duration',
    type: 'single',
    required: true,
    title: 'How long have you felt the need for psychological support?',
    options: [
      { id: 'lt_month', label: 'Less than a month' },
      { id: 'one_three', label: 'One to three months' },
      { id: 'six_months', label: 'At least six months' },
      { id: 'one_year', label: 'At least a year' },
      { id: 'gt_year', label: 'More than a year' },
      { id: 'unsure', label: "I don't remember exactly" },
    ],
  },
  {
    id: 'priorTherapy',
    type: 'single',
    required: false,
    title: 'Have you ever been in therapy?',
    description:
      'The information you share will only be seen by the therapist who follows you.',
    options: [
      { id: 'past', label: 'Yes, in the past' },
      { id: 'current', label: "Yes, I'm currently in therapy" },
      { id: 'first', label: 'No, this is the first time' },
    ],
  },
  {
    id: 'city',
    type: 'single',
    required: true,
    title: 'In which city would you like in-person sessions?',
    description: 'Choose the most convenient city for you.',
    options: [{ id: 'milan', label: 'Milan' }],
  },
  {
    id: 'zone',
    type: 'single',
    required: true,
    title: 'Which area of Milan would you like for in-person sessions?',
    options: [
      {
        id: 'sw',
        label: "South-West (Pagano, Famagosta, Sant'Ambrogio, Bande Nere, Navigli)",
      },
      {
        id: 'ne',
        label:
          'North-East (Caiazzo, Repubblica, Porta Venezia, Maggiolina, Loreto, Argonne, Città Studi)',
      },
      {
        id: 'se',
        label:
          'South-East (Città Studi, Loreto, Argonne, Porta Venezia, Porta Romana, Calvairate)',
      },
      { id: 'nw', label: 'North-West (Wagner, Sempione, Affori)' },
    ],
  },
  {
    id: 'genderPref',
    type: 'single',
    required: true,
    title: "Do you have a preference for your psychologist's gender?",
    description:
      "We'll do our best to match you with a therapist with these characteristics, if available in your area and time slots.",
    options: [
      { id: 'female', label: 'Woman' },
      { id: 'male', label: 'Man' },
      { id: 'any', label: 'No preference' },
    ],
  },
]
