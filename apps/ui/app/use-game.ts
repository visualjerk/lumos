import {
  GameAction,
  InvestigatorCard,
  LocationCard,
  LocationId,
  Position,
  Scenario,
  createGame,
  getLocationInvestigators,
} from '@lumos/game'
import { useEffect, useState } from 'react'

export type GameInvestigator = InvestigatorCard & {
  clues: number
  currentHealth: number
  actions: GameAction[]
}

export type GameLocation = LocationCard & {
  position: Position
  revealed: boolean
  clues: number
  actions: GameAction[]
  investigators: InvestigatorCard[]
}

export function useGame(
  scenario: Scenario,
  investigatorCards: InvestigatorCard[]
) {
  const [game, setGame] = useState(createGame(scenario, investigatorCards))

  useEffect(() => {
    const unsubscribe = game.subscribe(setGame)
    return unsubscribe
  }, [game])

  const { phase } = game
  const { context } = phase

  const investigators: GameInvestigator[] = context.investigatorCards.map(
    (investigator) => ({
      ...investigator,
      ...context.investigatorStates.get(investigator.id)!,
      actions: getInvestigatorActions(),
    })
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
  }
}
