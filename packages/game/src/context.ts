import { LocationStates, LocationId } from './location'
import {
  Investigator,
  InvestigatorCardCollection,
  InvestigatorId,
  InvestigatorStates,
  Skills,
  canDraw,
  discard,
  draw,
  play,
} from './investigator'
import { Scenario } from './scenario'
import { DoomCard, DoomCardId, DoomState } from './doom'
import { SceneCard, SceneState } from './scene'

export type Context = {
  scenario: Scenario
  doomState: DoomState
  sceneState: SceneState
  locationStates: LocationStates
  investigators: Investigator[]
  investigatorStates: InvestigatorStates
}

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

  return {
    scenario,
    doomState: { doom: 0, doomCardId: scenario.doomCards[0].id },
    sceneState: { sceneCardId: scenario.sceneCards[0].id },
    locationStates,
    investigators,
    investigatorStates,
  }
}

export function getDoomCard(context: Context): DoomCard {
  return context.scenario.doomCards.find(
    (card) => card.id === context.doomState.doomCardId
  )!
}

export function getNextDoomCardId(context: Context): DoomCardId | undefined {
  return getDoomCard(context).nextDoomCardId
}

export function getSceneCard(context: Context): SceneCard {
  return context.scenario.sceneCards.find(
    (card) => card.id === context.sceneState.sceneCardId
  )!
}

export function getTotalInvestigatorClues(context: Context): number {
  let totalClues = 0
  context.investigatorStates.forEach(({ clues }) => {
    totalClues += clues
  })
  return totalClues
}

export function getNextSceneCardId(context: Context): string | undefined {
  return getSceneCard(context).nextSceneCardId
}

export function getLocationInvestigators(
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

export function getInvestigator(
  context: Context,
  investigatorId: InvestigatorId
) {
  return context.investigators.find(
    (investigator) => investigator.id === investigatorId
  )!
}

export function canDrawFromDeck(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigatorState = context.investigatorStates.get(investigatorId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  return canDraw(investigatorState)
}

export function drawFromDeck(
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

export function discardFromHand(
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

export function playCardFromHand(
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

export function moveInvestigator(
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

export function getLocation(context: Context, locationId: LocationId) {
  return context.scenario.locationCards.find(
    (location) => location.id === locationId
  )!
}

export function getInvestigatorLocation(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigator = context.investigatorStates.get(investigatorId)

  if (!investigator) {
    throw new Error('Investigator not found')
  }

  const location = getLocation(context, investigator.currentLocation)

  if (!location) {
    throw new Error('Location not found')
  }

  return location
}

export function collectClue(
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

export function getInvestigatorState(
  context: Context,
  investigatorId: InvestigatorId
) {
  return context.investigatorStates.get(investigatorId)!
}

export function getInvestigatorCardsInHand(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigatorState = getInvestigatorState(context, investigatorId)

  return investigatorState.cardsInHand.map(
    (cardId) => InvestigatorCardCollection.get(cardId)!
  )
}

export function getInvestigatorCardsInPlay(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigatorState = getInvestigatorState(context, investigatorId)

  return investigatorState.cardsInPlay.map(
    (cardId) => InvestigatorCardCollection.get(cardId)!
  )
}

export function getLocationState(context: Context, locationId: LocationId) {
  return context.locationStates.get(locationId)!
}

export function getInvestigatorSkills(
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
