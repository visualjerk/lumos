import { LocationCard, LocationId, Layout } from '../location'
import { FateWheel } from '../fate'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
}
