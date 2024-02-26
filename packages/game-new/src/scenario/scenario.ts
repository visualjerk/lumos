import { LocationCard, LocationId, Layout } from '../location'
import { FateWheel } from '../fate'
import { DoomCard } from '../doom'
import { SceneCard } from '../scene'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
  doomCards: DoomCard[]
  sceneCards: SceneCard[]
}
