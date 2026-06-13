import { describe, expect, it } from 'vitest'
import { profileMeta } from './profileMeta'
import { testTherapists } from '@/test/fixtures'

const sara = testTherapists[0]
const head = profileMeta(sara, sara.id, 'https://example.test')

describe('profileMeta', () => {
  it('sets a per-therapist title (deduped against the root)', () => {
    expect(head.meta).toContainEqual({
      title: `${sara.name} · Therapist in Milan · Unobravo`,
    })
  })

  it('sets a per-therapist og:url', () => {
    expect(head.meta).toContainEqual({
      property: 'og:url',
      content: `https://example.test/therapist/${sara.id}`,
    })
  })

  it('sets per-therapist image alt for both og and twitter', () => {
    const alt = `${sara.name} — therapist in Milan on Unobravo`
    expect(head.meta).toContainEqual({ property: 'og:image:alt', content: alt })
    expect(head.meta).toContainEqual({ name: 'twitter:image:alt', content: alt })
  })

  it('emits a self-referential canonical link', () => {
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: `https://example.test/therapist/${sara.id}`,
    })
    expect(head.links).toHaveLength(1)
  })
})
