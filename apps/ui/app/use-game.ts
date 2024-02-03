import {
  DoomCard,
  DoomState,
  GameAction,
  Investigator,
  InvestigatorCard,
  InvestigatorCardCollection,
  InvestigatorState,
  LocationCard,
  LocationId,
  Position,
  Scenario,
  Skills,
  createGame,
  getDoomCard,
  getInvestigatorSkills,
  getLocationInvestigators,
} from '@lumos/game'
import { useEffect, useState } from 'react'

export type GameInvestigatorCard = InvestigatorCard & {
  actions: GameAction[]
}

export type GameInvestigator = Investigator &
  Omit<
    InvestigatorState,
    'cardsInHand' | 'cardsInPlay' | 'deck' | 'discardPile'
  > & {
    skills: Skills
    cardsInHand: GameInvestigatorCard[]
    cardsInPlay: GameInvestigatorCard[]
    deck: GameInvestigatorCard[]
    discardPile: GameInvestigatorCard[]
    actions: GameAction[]
  }

export type GameLocation = LocationCard & {
  position: Position
  revealed: boolean
  clues: number
  actions: GameAction[]
  investigators: Investigator[]
}

export type GameDoom = DoomCard & DoomState

export function useGame(scenario: Scenario, _investigators: Investigator[]) {
  const [game, setGame] = useState(createGame(scenario, _investigators))

  useEffect(() => {
    const unsubscribe = game.subscribe(setGame)
    return unsubscribe
  }, [game])

  const { phase } = game
  const { context } = phase

  const investigators: GameInvestigator[] = context.investigators.map(
    (investigator) => {
      const state = context.investigatorStates.get(investigator.id)!

      return {
        ...investigator,
        ...state,
        skills: getInvestigatorSkills(context, investigator.id),
        cardsInHand: state.cardsInHand.map((id, index) => ({
          ...InvestigatorCardCollection.get(id)!,
          actions: phase.actions.filter(
            (action) => action.handCardIndex === index
          ),
        })),
        cardsInPlay: state.cardsInPlay.map((id) => ({
          ...InvestigatorCardCollection.get(id)!,
          actions: [],
        })),
        deck: state.deck.map((id) => ({
          ...InvestigatorCardCollection.get(id)!,
          actions: [],
        })),
        discardPile: state.discardPile.map((id) => ({
          ...InvestigatorCardCollection.get(id)!,
          actions: [],
        })),
        actions: getInvestigatorActions(),
      }
    }
  )

  function getInvestigatorActions(): GameAction[] {
    return phase.actions.filter(
      (action) => action.locationId == null && action.handCardIndex == null
    )
  }

  const locations: GameLocation[] = context.scenario.locationCards.map(
    (location) => ({
      ...location,
      ...context.locationStates.get(location.id)!,
      position: context.scenario.layout.get(location.id)!,
      actions: getLocationActions(location.id),
      investigators: getLocationInvestigators(context, location.id),
    })
  )

  function getLocationActions(locationId: LocationId): GameAction[] {
    return phase.actions.filter((action) => action.locationId === locationId)
  }

  const doom: GameDoom = {
    ...getDoomCard(context),
    ...context.doomState,
  }

  return {
    investigators,
    locations,
    phase,
    doom,
  }
}
