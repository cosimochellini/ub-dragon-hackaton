import { createFileRoute, notFound } from '@tanstack/react-router'
import { therapistsQueryOptions } from '@/query/therapists'
import { PhoneFrame } from '@/components/shell/PhoneFrame'
import { ProfileScreen } from '@/components/profile/ProfileScreen'
import { TherapistNotFound } from '@/components/profile/TherapistNotFound'
import { profileMeta } from '@/components/profile/profileMeta'
import { SITE_URL } from '@/lib/site'

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
    return profileMeta(therapist, params.id, SITE_URL)
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
