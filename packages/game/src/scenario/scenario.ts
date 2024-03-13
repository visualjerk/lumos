import { LocationCard, LocationId, Layout } from '../location'
import { FateWheel } from '../fate'
import { DoomCard } from '../doom'
import { SceneCard } from '../scene'
import { EncounterCardId } from '../encounter'

export type ScenarioId = string

export type Scenario = {
  id: ScenarioId
  locationCards: LocationCard[]
  startLocation: LocationId
  layout: Layout
  fateWheel: FateWheel
  doomCards: DoomCard[]
  sceneCards: SceneCard[]
  encounterCards: EncounterCardId[]
}
