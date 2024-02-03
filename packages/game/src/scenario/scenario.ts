import type { LocationCard, LocationId, Layout } from '../location'
import type { FateWheel } from '../fate'
import { DoomCard } from '../doom'

export type Scenario = {
  locationCards: LocationCard[]
  doomCards: DoomCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
}
