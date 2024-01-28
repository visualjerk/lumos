import { LocationCard } from '../card/location-card'
import { Layout } from './layout'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationCard
  layout: Layout
}
