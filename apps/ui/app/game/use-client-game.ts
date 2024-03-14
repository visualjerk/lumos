import {
  Context,
  Investigator,
  InvestigatorId,
  PublicGame,
  PublicPhase,
  PublicPhaseAction,
  Scenario,
  createPublicGame,
} from '@lumos/game'
import { useEffect, useMemo, useRef, useState } from 'react'

export type HandleGameAction = (index: number) => Promise<void>

export function useClientGame(
  publicGame: PublicGame,
  controllerId: InvestigatorId,
  onAction: HandleGameAction
) {
  return useMemo(
    () => mapPublicGameToClientGame(publicGame, controllerId, onAction),
    [publicGame, controllerId]
  )
}

export type ClientGame = {
  phase: PublicPhase
  parentPhase: PublicPhase
  actions: PublicPhaseAction[]
  context: Context
  undo: () => void
  canUndo: boolean
  investigator: Investigator
}

function mapPublicGameToClientGame(
  game: PublicGame,
  controllerId: InvestigatorId,
  onAction: HandleGameAction
): ClientGame {
  const { phase, parentPhase, actions, context, canUndo } = game

  return {
    phase,
    parentPhase,
    actions: actions
      .map((action, index) => ({
        ...action,
        execute: () => onAction(index),
      }))
      .filter(
        (action) =>
          action.controllerId == null || action.controllerId === controllerId
      ),
    context,
    undo: () => game.undo(),
    canUndo,
    investigator: context.getInvestigator(controllerId),
  }
}

export function useClientGame_DEPRECATED(
  scenario: Scenario,
  investigators: Investigator[],
  controllerId: InvestigatorId
) {
  const game = useRef<PublicGame>()
  if (!game.current) {
    game.current = createPublicGame(scenario, investigators)
  }

  const [clientGame, setClientGame] = useState(
    mapPublicGameToClientGame_DEPRECATED(game.current, controllerId)
  )

  useEffect(
    () =>
      game.current!.onChange(() => {
        setClientGame(
          mapPublicGameToClientGame_DEPRECATED(game.current!, controllerId)
        )
      }),
    [controllerId]
  )

  useEffect(() => {
    setClientGame(
      mapPublicGameToClientGame_DEPRECATED(game.current!, controllerId)
    )
  }, [controllerId])

  return clientGame
}

function mapPublicGameToClientGame_DEPRECATED(
  game: PublicGame,
  controllerId: InvestigatorId
): ClientGame {
  const { phase, parentPhase, actions, context, canUndo } = game

  return {
    phase,
    parentPhase,
    actions: actions.filter(
      (action) =>
        action.controllerId == null || action.controllerId === controllerId
    ),
    context,
    undo: () => game.undo(),
    canUndo,
    investigator: context.getInvestigator(controllerId),
  }
}
