'use client'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { Game, InvestigatorCard } from '@lumos/game'
import React, { useEffect, useState } from 'react'

const investigator: InvestigatorCard = {
  id: 'isabel-brimble',
  name: 'Isabel Brimble',
  baseStats: {
    intelligence: 4,
    strength: 2,
    agility: 3,
  },
  health: 8,
}

export default function GameUI() {
  const [game, setGame] = useState(
    new Game(MisteryOfTheHogwartsExpress, [investigator])
  )
  function handleChange(newGame: Game) {
    setGame(
      Object.assign(Object.create(Object.getPrototypeOf(newGame)), newGame)
    )
  }
  useEffect(() => {
    game.addObserver(handleChange)
  }, [])

  return (
    <div className="grid grid-cols-10 grid-rows-6 gap-10">
      {game.locations.map((location) => (
        <div
          key={location.id}
          className={'w-32 h-32 bg-gray-200 p-2'}
          style={{
            gridColumn: location.position[0],
            gridRow: location.position[1],
          }}
        >
          <div>{location.name}</div>
          {location.investigators.map((investigator) => (
            <div key={investigator.id} className=" text-purple-500">
              {investigator.name}
            </div>
          ))}
          {location.actions.map((action, index) => (
            <button key={index} onClick={() => action.execute()}>
              {action.type}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
