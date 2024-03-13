import {
  LocationCard,
  Scenario,
  MinusOne,
  MinusThree,
  MinusTwo,
  PlusOne,
  Zero,
  DoomCard,
  SceneCard,
  VoidShock,
  Dementor,
} from '@lumos/game'

const Aisle2: LocationCard = {
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

const Aisle3: LocationCard = {
  id: 'aisle-3',
  name: 'Aisle 3',
  incomingConnection: 'circle',
  connections: ['moon', 'square', 'star', 'triangle'],
  initialClues: 1,
  shroud: 0,
}

const Compartment34: LocationCard = {
  id: 'compartment-34',
  name: 'Compartment 34',
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

const LightsOut: DoomCard = {
  id: 'lights-out',
  treshold: 2,
  name: 'Lights Out',
  story:
    'The lights go out and you see flashes of light in the dark through the stained glass windows.',
  consequence: 'The train stops and you hear a scream.',
  nextDoomCardId: 'dark-shadow',
}

const DarkShadow: DoomCard = {
  id: 'dark-shadow',
  treshold: 2,
  name: 'Dark Shadow',
  story:
    'You see a dark shadow moving in the dark. The clouds outside get darker and darker until no moonlight can be seen.',
  consequence:
    'Something dark and sinister gets hold of you. The room gets colder and colder until you can no longer move.',
}

const AloneInTheDark: SceneCard = {
  id: 'alone-in-the-dark',
  name: 'Alone in the Dark',
  story:
    'You are alone in the dark of your compartment and you hear something moving in the shadows.',
  clueTreshold: 3,
  consequence:
    'You find the source of the light flashes is a storm wyvern, a species that lives way up in the northern mountain range. What on earth is it doing here?',
  nextSceneCardId: 'storm-wyvern',
}

const StormWyvern: SceneCard = {
  id: 'storm-wyvern',
  name: 'Storm Wyvern',
  story:
    'The wyvern seems to be looking for something. It looks at you and franticly flies around the train.',
  clueTreshold: 3,
  consequence:
    'You find a baby wyvern in a small cage. You free it and open a window, so it can fly away. Its mother seems to be content and flies away as well.',
}

export const MisteryOfTheHogwartsExpress: Scenario = {
  locationCards: [
    Aisle2,
    Compartment24,
    Compartment25,
    Aisle3,
    Compartment34,
    Compartment35,
    BoardRestaurant,
  ],
  doomCards: [LightsOut, DarkShadow],
  sceneCards: [AloneInTheDark, StormWyvern],
  encounterCards: [VoidShock.id, VoidShock.id, Dementor.id, Dementor.id],
  startLocation: Compartment34.id,
  layout: new Map([
    [Aisle2.id, [2, 2]],
    [Compartment24.id, [1, 4]],
    [Compartment25.id, [3, 4]],
    [Aisle3.id, [6, 2]],
    [Compartment34.id, [5, 4]],
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
    { symbol: 'autoFail', modifySkillCheck: () => 0 },
    { symbol: 'cultist', modifySkillCheck: (skill) => skill - 3 },
  ],
}
