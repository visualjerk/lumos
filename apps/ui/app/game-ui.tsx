'use client'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { InvestigatorCard, createGame } from '@lumos/game'
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
    createGame(MisteryOfTheHogwartsExpress, [investigator])
  )
  useEffect(() => {
    const unsubscribe = game.subscribe(setGame)
    return unsubscribe
  }, [game])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        {game.investigators.map((investigator) => (
          <div key={investigator.id}>
            <div className="text-purple-500">{investigator.name}</div>
            <div>Clues: {investigator.clues}</div>
            <div>Intelligence: {investigator.baseStats.intelligence}</div>
            <div className="flex flex-row gap-3">
              {investigator.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.execute()}
                  className="p-1 bg-gray-200"
                >
                  {action.type}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-11 grid-rows-11 gap-10">
        {game.locations.map((location) => (
          <div
            key={location.id}
            className={
              'h-40 bg-gray-200 p-2 ' +
              (location.revealed === true ? 'bg-gray-200' : 'bg-gray-400')
            }
            style={{
              gridColumn: `${location.position[0]} / span 2`,
              gridRow: `${location.position[1]} / span 2`,
            }}
          >
            <div>{location.name}</div>
            {location.revealed === true && (
              <div>
                Clues {location.clues} Shroud {location.shroud}
              </div>
            )}
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
    </div>
  )
}
