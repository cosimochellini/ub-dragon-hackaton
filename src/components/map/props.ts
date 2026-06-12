import type { Studio, Therapist } from '@/lib/types'

/** Shared props for the interchangeable map renderers (stylized + Leaflet). */
export interface MapProps {
  therapists: Therapist[]
  studios: Record<string, Studio>
  selectedId: string | null
  onSelect: (id: string) => void
}
