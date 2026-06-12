import { queryOptions } from '@tanstack/react-query'
import { getTherapists } from '@/lib/therapists-data'

export const therapistsQueryOptions = () =>
  queryOptions({
    queryKey: ['therapists'],
    queryFn: () => getTherapists(),
    staleTime: Infinity,
  })
