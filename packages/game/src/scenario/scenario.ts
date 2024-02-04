import type { LocationCard, LocationId, Layout } from '../location'
import type { FateWheel } from '../fate'
import { DoomCard } from '../doom'
import { SceneCard } from '../scene'
import { EncounterCard } from '../encounter'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
  doomCards: DoomCard[]
  sceneCards: SceneCard[]
  encounterCards: EncounterCard[]
}
