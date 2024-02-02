import {
  GameAction,
  Investigator,
  InvestigatorCard,
  InvestigatorCardCollection,
  InvestigatorState,
  LocationCard,
  LocationId,
  Position,
  Scenario,
  createGame,
  getLocationInvestigators,
} from '@lumos/game'
import { useEffect, useState } from 'react'

export type GameInvestigatorCard = InvestigatorCard & {
  actions: GameAction[]
}

export type GameInvestigator = Investigator &
  Omit<InvestigatorState, 'cardsInHand'> & {
    cardsInHand: GameInvestigatorCard[]
    actions: GameAction[]
  }

export type GameLocation = LocationCard & {
  position: Position
  revealed: boolean
  clues: number
  actions: GameAction[]
  investigators: Investigator[]
}

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
        cardsInHand: state.cardsInHand.map((id) => ({
          ...InvestigatorCardCollection.get(id)!,
          actions: [],
        })),
        actions: getInvestigatorActions(),
      }
    }
  )

  function getInvestigatorActions(): GameAction[] {
    return phase.actions.filter(
      (action) => action.investigatorId != null && action.locationId == null
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

  return {
    investigators,
    locations,
    phase,
  }
}
