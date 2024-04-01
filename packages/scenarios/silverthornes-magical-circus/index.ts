import {
  DoomCard,
  LocationCard,
  MinusOne,
  MinusThree,
  MinusTwo,
  PlusOne,
  Scenario,
  SceneCard,
  Zero,
} from '@lumos/game'

const MainTent: LocationCard = {
  id: 'main-tent',
  name: 'Main Tent',
  incomingConnection: 'circle',
  connections: ['star', 'cross'],
  initialClues: 3,
  shroud: 2,
}

const CarnivalMidway: LocationCard = {
  id: 'carnival-midway',
  name: 'Carnival Midway',
  incomingConnection: 'star',
  connections: ['circle', 'cross', 'moon', 'diamond'],
  initialClues: 2,
  shroud: 2,
}

const EnchantedMenagerie: LocationCard = {
  id: 'enchanted-menagerie',
  name: 'Enchanted Menagerie',
  incomingConnection: 'cross',
  connections: ['circle', 'star', 'diamond'],
  initialClues: 2,
  shroud: 3,
}

const FortuneTellersWagon: LocationCard = {
  id: 'fortune-tellers-wagon',
  name: "Fortune Teller's Wagon",
  incomingConnection: 'heart',
  connections: ['diamond'],
  initialClues: 2,
  shroud: 4,
}

const WanderingWoods: LocationCard = {
  id: 'wandering-woods',
  name: 'Wandering Woods',
  incomingConnection: 'diamond',
  connections: ['heart', 'star', 'cross'],
  initialClues: 3,
  shroud: 2,
}

const MagiciansWorkshop: LocationCard = {
  id: 'magicians-workshop',
  name: "Magician's Workshop",
  incomingConnection: 'moon',
  connections: ['star'],
  initialClues: 3,
  shroud: 3,
}

const VanishingAct: DoomCard = {
  id: 'vanishing-act',
  name: 'Vanishing Act',
  story:
    'Mr. Silverthorne, the ringmaster, has vanished without a trace, leaving the circus in disarray. The performers are on edge, and the audience is growing restless.',
  consequence:
    'Another performer disappears without a trace, leaving behind only whispers of their presence.',
  treshold: 3,
}

const MagicalCircus: SceneCard = {
  id: 'magical-circus',
  name: 'Magical Circus',
  story:
    'Amidst the colorful tents and fluttering banners, you sense an undercurrent of mystery, beckoning you to delve deeper into the enchantment that surrounds you.',
  consequence: '',
  clueTreshold: 3,
}

export const SilverthornesMagicalCircus: Scenario = {
  locationCards: [
    MainTent,
    CarnivalMidway,
    EnchantedMenagerie,
    FortuneTellersWagon,
    WanderingWoods,
    MagiciansWorkshop,
  ],
  layout: new Map([
    [FortuneTellersWagon.id, [1, 1]],
    [WanderingWoods.id, [3, 1]],
    [EnchantedMenagerie.id, [5, 1]],
    [MainTent.id, [6, 3]],
    [CarnivalMidway.id, [4, 3]],
    [MagiciansWorkshop.id, [2, 3]],
  ]),
  startLocation: CarnivalMidway.id,
  doomCards: [VanishingAct],
  sceneCards: [MagicalCircus],
  encounterCards: [],
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
