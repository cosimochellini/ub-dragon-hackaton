import type { Therapist } from '@/lib/types'

/**
 * Per-therapist head metadata for the profile route. Returns only meta entries
 * that TanStack Router dedupes by `name`/`property`, so they override the root's
 * defaults. The `canonical` link and the `noindex` robots tag stay owned by the
 * root — duplicating the canonical `<link>` (links aren't deduped) would be a
 * bug. The shared OG image is inherited from the root; only its alt is per-person.
 */
export function profileMeta(therapist: Therapist, id: string, siteUrl: string) {
  const title = `${therapist.name} · Therapist in Milan · Unobravo`
  const description = `${therapist.name}, ${therapist.profile.headline.toLowerCase()} in Milan with a ${therapist.profile.orientation.toLowerCase()} approach. Book a free intro call.`
  const imageAlt = `${therapist.name} — therapist in Milan on Unobravo`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `${siteUrl}/therapist/${id}` },
      { property: 'og:image:alt', content: imageAlt },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image:alt', content: imageAlt },
    ],
  }
}
