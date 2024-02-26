import { DoomCard } from '../doom'
import { MinusThree, MinusTwo, MinusOne, Zero, PlusOne } from '../fate'
import { LocationCard } from '../location'
import { Scenario } from '../scenario'
import { SceneCard } from '../scene'

export const Aisle2: LocationCard = {
  id: 'aisle-2',
  name: 'Aisle 2',
  incomingConnection: 'moon',
  connections: ['diamond', 'heart', 'circle'],
  initialClues: 1,
  shroud: 2,
}

const Compartment24: LocationCard = {
  id: 'compartment-24',
  name: 'Compartment 24',
  incomingConnection: 'diamond',
  connections: ['moon'],
  initialClues: 3,
  shroud: 3,
}

const Compartment25: LocationCard = {
  id: 'compartment-25',
  name: 'Compartment 25',
  incomingConnection: 'heart',
  connections: ['moon'],
  initialClues: 4,
  shroud: 2,
}

export const Aisle3: LocationCard = {
  id: 'aisle-3',
  name: 'Aisle 3',
  incomingConnection: 'circle',
  connections: ['moon', 'square', 'star', 'triangle'],
  initialClues: 1,
  shroud: 0,
}

export const START_LOCATION: LocationCard = {
  id: 'start-location',
  name: 'Start Location',
  incomingConnection: 'square',
  connections: ['circle'],
  initialClues: 3,
  shroud: 2,
}

const Compartment35: LocationCard = {
  id: 'compartment-35',
  name: 'Compartment 35',
  incomingConnection: 'star',
  connections: ['circle'],
  initialClues: 2,
  shroud: 2,
}

const BoardRestaurant: LocationCard = {
  id: 'board-restaurant',
  name: 'Board Restaurant',
  incomingConnection: 'triangle',
  connections: ['circle'],
  initialClues: 4,
  shroud: 3,
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
  locationCards: [
    Aisle2,
    Compartment24,
    Compartment25,
    Aisle3,
    START_LOCATION,
    Compartment35,
    BoardRestaurant,
  ],
  startLocation: START_LOCATION.id,
  layout: new Map([
    [Aisle2.id, [2, 2]],
    [Compartment24.id, [1, 4]],
    [Compartment25.id, [3, 4]],
    [Aisle3.id, [6, 2]],
    [START_LOCATION.id, [5, 4]],
    [Compartment35.id, [7, 4]],
    [BoardRestaurant.id, [8, 2]],
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
}
