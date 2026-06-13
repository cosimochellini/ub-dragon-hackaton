import type { Therapist } from '@/lib/types'

/**
 * Per-therapist head metadata for the profile route. The meta entries override
 * the root's defaults (TanStack Router dedupes meta by `name`/`property`); the
 * self-referential `canonical` link is owned per route, so each page is its own
 * canonical rather than all pointing at `/`. The `noindex` robots tag and the
 * shared OG image are inherited from the root; only the image alt is per-person.
 */
export function profileMeta(therapist: Therapist, id: string, siteUrl: string) {
  const title = `${therapist.name} · Therapist in Milan · Unobravo`
  const description = `${therapist.name}, ${therapist.profile.headline.toLowerCase()} in Milan with a ${therapist.profile.orientation.toLowerCase()} approach. Book a free intro call.`
  const imageAlt = `${therapist.name} — therapist in Milan on Unobravo`
  const url = `${siteUrl}/therapist/${id}`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image:alt', content: imageAlt },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image:alt', content: imageAlt },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
