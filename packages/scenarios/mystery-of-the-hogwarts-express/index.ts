import {
  LocationCard,
  Scenario,
  MinusOne,
  MinusThree,
  MinusTwo,
  PlusOne,
  Zero,
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
    { symbol: 'autoFail', modifySkillCheck: (skill) => 0 },
    { symbol: 'cultist', modifySkillCheck: (skill) => skill - 3 },
  ],
}
