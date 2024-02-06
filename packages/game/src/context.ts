import { LocationStates, LocationId, LocationCard } from './location'
import {
  Investigator,
  InvestigatorCard,
  InvestigatorCardCollection,
  InvestigatorId,
  InvestigatorState,
  InvestigatorStates,
  Skills,
  addToDiscardPile,
  canDraw,
  discard,
  draw,
  play,
  removeFromHand,
} from './investigator'
import { Scenario } from './scenario'
import { DoomCard, DoomCardId, DoomState } from './doom'
import { SceneCard, SceneState } from './scene'
import {
  EncounterState,
  draw as drawEncounter,
  discardCurrent as discardCurrentEncounter,
} from './encounter'

export function createInitialContext(
  scenario: Scenario,
  investigators: Investigator[]
): Context {
  const locationStates = new LocationStates(scenario.locationCards)
  const investigatorStates = new InvestigatorStates(
    investigators,
    scenario.startLocation
  )
  locationStates.get(scenario.startLocation)!.revealed = true

  return new Context(
    scenario,
    { doom: 0, doomCardId: scenario.doomCards[0].id },
    { sceneCardId: scenario.sceneCards[0].id },
    {
      deck: scenario.encounterCards.map(({ id }) => id),
      discardPile: [],
      currentCardId: null,
      investigatorId: null,
    },
    locationStates,
    investigators,
    investigatorStates
  )
}

export class Context {
  constructor(
    public scenario: Scenario,
    public doomState: DoomState,
    public sceneState: SceneState,
    public encounterState: EncounterState,
    public locationStates: LocationStates,
    public investigators: Investigator[],
    public investigatorStates: InvestigatorStates
  ) {}

  getDoomCard(): DoomCard {
    return getDoomCard(this)
  }

  getNextDoomCardId(): DoomCardId | undefined {
    return getNextDoomCardId(this)
  }

  getSceneCard(): SceneCard {
    return getSceneCard(this)
  }

  getTotalInvestigatorClues(): number {
    return getTotalInvestigatorClues(this)
  }

  getNextSceneCardId(): string | undefined {
    return getNextSceneCardId(this)
  }

  getLocationInvestigators(locationId: LocationId): Investigator[] {
    return getLocationInvestigators(this, locationId)
  }

  getInvestigator(investigatorId: InvestigatorId) {
    return getInvestigator(this, investigatorId)
  }

  canDrawFromDeck(investigatorId: InvestigatorId) {
    return canDrawFromDeck(this, investigatorId)
  }

  drawFromDeck(investigatorId: InvestigatorId): Context {
    return drawFromDeck(this, investigatorId)
  }

  discardFromHand(investigatorId: InvestigatorId, cardIndex: number): Context {
    return discardFromHand(this, investigatorId, cardIndex)
  }

  removeCardFromHand(
    investigatorId: InvestigatorId,
    cardIndex: number
  ): Context {
    return removeCardFromHand(this, investigatorId, cardIndex)
  }

  addCardToDiscardPile(
    investigatorId: InvestigatorId,
    cardId: string
  ): Context {
    return addCardToDiscardPile(this, investigatorId, cardId)
  }

  playCardFromHand(investigatorId: InvestigatorId, cardIndex: number): Context {
    return playCardFromHand(this, investigatorId, cardIndex)
  }

  getEncounterCard(encounterCardId: string) {
    return getEncounterCard(this, encounterCardId)
  }

  drawEncounterCard(): Context {
    return drawEncounterCard(this)
  }

  discardCurrentEncounterCard(): Context {
    return discardCurrentEncounterCard(this)
  }

  moveInvestigator(
    investigatorId: InvestigatorId,
    locationId: LocationId
  ): Context {
    return moveInvestigator(this, investigatorId, locationId)
  }

  getLocation(locationId: LocationId): LocationCard {
    return getLocation(this, locationId)
  }

  getInvestigatorLocation(investigatorId: InvestigatorId): LocationCard {
    return getInvestigatorLocation(this, investigatorId)
  }

  collectClue(investigatorId: InvestigatorId, locationId: LocationId): Context {
    return collectClue(this, investigatorId, locationId)
  }

  getInvestigatorState(investigatorId: InvestigatorId): InvestigatorState {
    return getInvestigatorState(this, investigatorId)
  }

  getInvestigatorCardsInHand(
    investigatorId: InvestigatorId
  ): InvestigatorCard[] {
    return getInvestigatorCardsInHand(this, investigatorId)
  }

  getInvestigatorCardsInPlay(
    investigatorId: InvestigatorId
  ): InvestigatorCard[] {
    return getInvestigatorCardsInPlay(this, investigatorId)
  }

  getInvestigatorCard(cardId: string): InvestigatorCard {
    return getInvestigatorCard(cardId)
  }

  getInvestigatorSkills(investigatorId: InvestigatorId): Skills {
    return getInvestigatorSkills(this, investigatorId)
  }
}

function getDoomCard(context: Context): DoomCard {
  return context.scenario.doomCards.find(
    (card) => card.id === context.doomState.doomCardId
  )!
}

function getNextDoomCardId(context: Context): DoomCardId | undefined {
  return getDoomCard(context).nextDoomCardId
}

function getSceneCard(context: Context): SceneCard {
  return context.scenario.sceneCards.find(
    (card) => card.id === context.sceneState.sceneCardId
  )!
}

function getTotalInvestigatorClues(context: Context): number {
  let totalClues = 0
  context.investigatorStates.forEach(({ clues }) => {
    totalClues += clues
  })
  return totalClues
}

function getNextSceneCardId(context: Context): string | undefined {
  return getSceneCard(context).nextSceneCardId
}

function getLocationInvestigators(
  context: Context,
  locationId: LocationId
): Investigator[] {
  const investigators: Investigator[] = []
  context.investigatorStates.forEach((investigatorState, investigatorId) => {
    if (investigatorState.currentLocation !== locationId) {
      return
    }
    investigators.push(getInvestigator(context, investigatorId)!)
  })

  return investigators
}

function getInvestigator(context: Context, investigatorId: InvestigatorId) {
  return context.investigators.find(
    (investigator) => investigator.id === investigatorId
  )!
}

function canDrawFromDeck(context: Context, investigatorId: InvestigatorId) {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  return canDraw(investigatorState)
}

function drawFromDeck(
  context: Context,
  investigatorId: InvestigatorId
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  context.investigatorStates.set(investigatorId, draw(investigatorState))

  return context
}

function discardFromHand(
  context: Context,
  investigatorId: InvestigatorId,
  cardIndex: number
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  context.investigatorStates.set(
    investigatorId,
    discard(investigatorState, cardIndex)
  )

  return context
}

function removeCardFromHand(
  context: Context,
  investigatorId: InvestigatorId,
  cardIndex: number
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  context.investigatorStates.set(
    investigatorId,
    removeFromHand(investigatorState, cardIndex)
  )

  return context
}

function addCardToDiscardPile(
  context: Context,
  investigatorId: InvestigatorId,
  cardId: string
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  context.investigatorStates.set(
    investigatorId,
    addToDiscardPile(investigatorState, cardId)
  )

  return context
}

function playCardFromHand(
  context: Context,
  investigatorId: InvestigatorId,
  cardIndex: number
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  context.investigatorStates.set(
    investigatorId,
    play(investigatorState, cardIndex)
  )

  return context
}

function getEncounterCard(context: Context, encounterCardId: string) {
  return context.scenario.encounterCards.find(
    (card) => card.id === encounterCardId
  )!
}

function drawEncounterCard(context: Context): Context {
  context.encounterState = drawEncounter(context.encounterState)
  return context
}

function discardCurrentEncounterCard(context: Context): Context {
  context.encounterState = discardCurrentEncounter(context.encounterState)
  return context
}

function moveInvestigator(
  context: Context,
  investigatorId: InvestigatorId,
  locationId: LocationId
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)
  const locationState = context.locationStates.get(locationId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  if (!locationState) {
    throw new Error('Location not found')
  }

  investigatorState.currentLocation = locationId
  locationState.revealed = true

  return context
}

function getLocation(context: Context, locationId: LocationId) {
  return context.scenario.locationCards.find(
    (location) => location.id === locationId
  )!
}

function getInvestigatorLocation(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigator = context.investigatorStates.get(investigatorId)

  if (!investigator) {
    throw new Error('Investigator not found')
  }

  const location = context.getLocation(investigator.currentLocation)

  if (!location) {
    throw new Error('Location not found')
  }

  return location
}

function collectClue(
  context: Context,
  investigatorId: InvestigatorId,
  locationId: LocationId
): Context {
  const investigator = context.investigatorStates.get(investigatorId)
  const location = context.locationStates.get(locationId)

  if (!investigator) {
    throw new Error('Investigator not found')
  }

  if (!location) {
    throw new Error('Location not found')
  }

  if (!location.revealed) {
    throw new Error('Location not revealed')
  }

  if (location.clues === 0) {
    throw new Error('Location has no clues')
  }

  location.clues--
  investigator.clues++

  return context
}

function getInvestigatorState(
  context: Context,
  investigatorId: InvestigatorId
) {
  return context.investigatorStates.get(investigatorId)!
}

function getInvestigatorCardsInHand(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigatorState = context.getInvestigatorState(investigatorId)

  return investigatorState.cardsInHand.map(getInvestigatorCard)
}

function getInvestigatorCardsInPlay(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigatorState = context.getInvestigatorState(investigatorId)

  return investigatorState.cardsInPlay.map(getInvestigatorCard)
}

export function getInvestigatorCard(cardId: string) {
  return InvestigatorCardCollection.get(cardId)!
}

function getLocationState(context: Context, locationId: LocationId) {
  return context.locationStates.get(locationId)!
}

function getInvestigatorSkills(
  context: Context,
  investigatorId: InvestigatorId
): Skills {
  const investigator = getInvestigator(context, investigatorId)
  const cards = getInvestigatorCardsInPlay(context, investigatorId)

  const skills = { ...investigator.baseSkills }
  Object.keys(skills).forEach((skill) => {
    cards.forEach((card) => {
      skills[skill as keyof Skills] +=
        card.permanentSkillModifier?.[skill as keyof Skills] ?? 0
    })
  })

  return skills
}
