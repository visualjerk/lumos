import { LocationCard, Scenario } from '@lumos/game'

const Aisle3: LocationCard = {
  id: 'aisle-3',
  name: 'Aisle 3',
  incomingConnection: 'circle',
  connections: ['moon', 'square', 'star', 'triangle'],
}

const Compartment34: LocationCard = {
  id: 'compartment-34',
  name: 'Compartment 34',
  incomingConnection: 'square',
  connections: ['circle'],
}

const Compartment35: LocationCard = {
  id: 'compartment-35',
  name: 'Compartment 35',
  incomingConnection: 'star',
  connections: ['circle'],
}

const BoardRestaurant: LocationCard = {
  id: 'board-restaurant',
  name: 'Board Restaurant',
  incomingConnection: 'triangle',
  connections: ['circle'],
}

export const MisteryOfTheHogwartsExpress: Scenario = {
  locationCards: [Aisle3, Compartment34, Compartment35, BoardRestaurant],
  startLocation: Compartment34,
  layout: new Map([
    [Aisle3.id, [4, 2]],
    [Compartment34.id, [3, 3]],
    [Compartment35.id, [4, 3]],
    [BoardRestaurant.id, [5, 2]],
  ]),
}
