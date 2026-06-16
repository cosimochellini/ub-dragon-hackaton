import { queryOptions } from '@tanstack/react-query'
import { getTherapists } from '@/lib/therapists-data'

export const therapistsQueryOptions = () =>
  queryOptions({
    queryKey: ['therapists'],
    queryFn: () => getTherapists(),
    // Dates are resolved server-side per request; the cache is kept fresh for
    // the session so SSR and client agree. A reload re-runs the server fn (so
    // the day window re-anchors). For a long-lived session crossing midnight
    // you'd key this by the current Rome day instead — out of scope for the mock POC.
    staleTime: Infinity,
  })
