import { LocationCard, LocationId } from '../card/location-card'
import { Layout } from './layout'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
}
