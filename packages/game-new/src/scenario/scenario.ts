import { LocationCard, LocationId, Layout } from '../location'
import { FateWheel } from '../fate'
import { DoomCard } from '../doom'
import { SceneCard } from '../scene'
import { EncounterCardId } from '../encounter'

export type Scenario = {
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
  doomCards: DoomCard[]
  sceneCards: SceneCard[]
  encounterCards: EncounterCardId[]
}
