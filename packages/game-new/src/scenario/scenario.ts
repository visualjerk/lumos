import { LocationCard, LocationId, Layout } from '../location'
import { FateWheel } from '../fate'
import { DoomCard } from '../doom'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
  doomCards: DoomCard[]
}
