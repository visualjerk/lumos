import { LocationCard, LocationId } from '../card/location-card'
import { FateWheel } from '../fate'
import { Layout } from './layout'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
}
