import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { therapistsQueryOptions } from '@/query/therapists'
import { PhoneFrame } from '@/components/shell/PhoneFrame'
import { OnboardingGate } from '@/components/onboarding/OnboardingGate'
import { SITE_URL } from '@/lib/site'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(therapistsQueryOptions()),
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/` }],
  }),
  component: Home,
})

function Home() {
  const { data } = useSuspenseQuery(therapistsQueryOptions())
  return (
    <PhoneFrame>
      <OnboardingGate therapists={data.therapists} studios={data.studios} />
    </PhoneFrame>
  )
}
