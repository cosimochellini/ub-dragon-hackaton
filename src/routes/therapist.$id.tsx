import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { therapistsQueryOptions } from '@/query/therapists'
import { PhoneFrame } from '@/components/shell/PhoneFrame'
import { ProfileScreen } from '@/components/profile/ProfileScreen'
import { Icon } from '@/components/icon/Icon'

// Absolute origin for the per-therapist Open Graph URL; mirrors __root.tsx.
const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? 'https://ub-dragon.netlify.app'
).replace(/\/+$/, '')

export const Route = createFileRoute('/therapist/$id')({
  loader: async ({ context, params }) => {
    // Reuse the already-cached directory data — no extra server round-trip and
    // the same resolved dates as the list, so there's no hydration mismatch.
    const data = await context.queryClient.ensureQueryData(
      therapistsQueryOptions(),
    )
    const therapist = data.therapists.find((t) => t.id === params.id)
    if (!therapist) throw notFound()
    return { therapist, studios: data.studios }
  },
  head: ({ loaderData, params }) => {
    const therapist = loaderData?.therapist
    if (!therapist) return {}
    const title = `${therapist.name} · Therapist in Milan · Unobravo`
    const description = `${therapist.name}, ${therapist.profile.headline.toLowerCase()} in Milan with a ${therapist.profile.orientation.toLowerCase()} approach. Book a free intro call.`
    const imageAlt = `${therapist.name} — therapist in Milan on Unobravo`
    // Override only deduped meta (by name/property). The root's `noindex` robots
    // tag and the single `canonical` link are intentionally left untouched —
    // duplicating the canonical <link> (links aren't deduped) would be a bug.
    // The shared OG image is inherited from the root; only its alt is per-person.
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: `${SITE_URL}/therapist/${params.id}` },
        { property: 'og:image:alt', content: imageAlt },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image:alt', content: imageAlt },
      ],
    }
  },
  notFoundComponent: TherapistNotFound,
  component: TherapistProfilePage,
})

function TherapistProfilePage() {
  const { therapist, studios } = Route.useLoaderData()
  return (
    <PhoneFrame>
      <ProfileScreen therapist={therapist} studios={studios} />
    </PhoneFrame>
  )
}

function TherapistNotFound() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-grey-100">
          <Icon name="search" size={26} color="var(--color-grey-500)" />
        </div>
        <div>
          <div className="font-display text-[18px] font-bold text-grey-900">
            Therapist not found
          </div>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-grey-600">
            This profile doesn&apos;t exist or is no longer available.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-candy-600 px-[18px] py-[10px] text-[14px] font-semibold text-white hover:brightness-95"
        >
          Back to directory
        </Link>
      </div>
    </PhoneFrame>
  )
}
