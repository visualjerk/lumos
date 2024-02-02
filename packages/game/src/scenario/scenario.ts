import type { LocationCard, LocationId, Layout } from '../location'
import type { FateWheel } from '../fate'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
}
