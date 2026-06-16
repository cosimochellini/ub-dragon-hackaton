import type { Studio, Therapist } from '@/lib/types'

/** Shared props for the interchangeable map renderers (stylized + Leaflet). */
export interface MapProps {
  therapists: Therapist[]
  studios: Record<string, Studio>
  selectedId: string | null
  /**
   * Select a therapist. `groupTherapistIds` carries every therapist behind the
   * tapped pin (a multi-therapist studio or a whole cluster) so the carousel can
   * narrow to that group; a single-therapist pin omits it (or sends one id).
   */
  onSelect: (id: string, groupTherapistIds?: string[]) => void
}
