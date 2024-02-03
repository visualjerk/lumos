import type { LocationCard, LocationId, Layout } from '../location'
import type { FateWheel } from '../fate'
import { DoomCard } from '../doom'
import { SceneCard } from '../scene'

export type Scenario = {
  locationCards: LocationCard[]
  doomCards: DoomCard[]
  sceneCards: SceneCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
}
