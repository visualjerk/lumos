import { DoomCard } from '../doom'
import { MinusThree, MinusTwo, MinusOne, Zero, PlusOne } from '../fate'
import { LocationCard } from '../location'
import { Scenario } from '../scenario'
import { SceneCard } from '../scene'

export const START_LOCATION: LocationCard = {
  id: 'start-location',
  name: 'Start Location',
  incomingConnection: 'square',
  connections: ['circle'],
  initialClues: 3,
  shroud: 2,
}

export const SECOND_LOCATION: LocationCard = {
  id: 'second-location',
  name: 'Second Location',
  incomingConnection: 'circle',
  connections: ['moon', 'square'],
  initialClues: 1,
  shroud: 0,
}

export const THIRD_LOCATION: LocationCard = {
  id: 'third-location',
  name: 'Third Location',
  incomingConnection: 'moon',
  connections: ['circle'],
  initialClues: 1,
  shroud: 2,
}

export const FIRST_DOOM_CARD: DoomCard = {
  id: 'first-doom-card',
  name: 'First Doom Card',
  story: 'First doom card story',
  consequence: 'First doom card consequences',
  treshold: 3,
  nextDoomCardId: 'second-doom-card',
}

export const SECOND_DOOM_CARD: DoomCard = {
  id: 'second-doom-card',
  name: 'Second Doom Card',
  story: 'Second doom card story',
  consequence: 'Second doom card consequences',
  treshold: 2,
}

export const FIRST_SCENE_CARD: SceneCard = {
  id: 'first-scene-card',
  name: 'First Scene Card',
  story: 'First scene card story',
  clueTreshold: 3,
  consequence: 'First scene card consequences',
  nextSceneCardId: 'second-scene-card',
}

export const SECOND_SCENE_CARD: SceneCard = {
  id: 'second-scene-card',
  name: 'Second Scene Card',
  story: 'Second scene card story',
  clueTreshold: 2,
  consequence: 'Second scene card consequences',
}

export const MOCK_SCENARIO: Scenario = {
  locationCards: [START_LOCATION, SECOND_LOCATION, THIRD_LOCATION],
  startLocation: START_LOCATION.id,
  layout: new Map([
    [START_LOCATION.id, [5, 4]],
    [SECOND_LOCATION.id, [2, 2]],
    [THIRD_LOCATION.id, [6, 2]],
  ]),
  fateWheel: [
    MinusThree,
    MinusTwo,
    MinusOne,
    MinusOne,
    Zero,
    Zero,
    PlusOne,
    { symbol: 'autoFail', modifySkillCheck: (skill) => 0 },
    { symbol: 'cultist', modifySkillCheck: (skill) => skill - 3 },
  ],
  doomCards: [FIRST_DOOM_CARD, SECOND_DOOM_CARD],
  sceneCards: [FIRST_SCENE_CARD, SECOND_SCENE_CARD],
  encounterCards: [
    'ec-void-shock',
    'ec-void-shock',
    'ec-void-shock',
    'ec-void-shock',
  ],
}
