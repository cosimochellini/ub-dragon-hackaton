import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { therapistsQueryOptions } from '@/query/therapists'
import { PhoneFrame } from '@/components/shell/PhoneFrame'
import { MilanApp } from '@/components/MilanApp'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(therapistsQueryOptions()),
  component: Home,
})

function Home() {
  const { data } = useSuspenseQuery(therapistsQueryOptions())
  return (
    <PhoneFrame>
      <MilanApp therapists={data.therapists} studios={data.studios} />
    </PhoneFrame>
  )
}
