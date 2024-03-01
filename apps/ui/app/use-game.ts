import {
  Investigator,
  PublicGame,
  Scenario,
  createInitialPublicGame,
} from '@lumos/game'
import { useEffect, useRef, useState } from 'react'

export function useGame(scenario: Scenario, investigators: Investigator[]) {
  const game = useRef<PublicGame>()
  if (!game.current) {
    game.current = createInitialPublicGame(scenario, investigators)
  }

  const [projection, setProjection] = useState(projectGame(game.current))

  useEffect(
    () =>
      game.current!.onChange(() => {
        setProjection(projectGame(game.current!))
      }),
    []
  )

  return projection
}

function projectGame(game: PublicGame) {
  const { phase, parentPhase, actions } = game

  return {
    phase,
    parentPhase,
    actions,
  }
}
