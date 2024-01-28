'use client'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { Game, InvestigatorCard } from '@lumos/game'
import React from 'react'

const investigator: InvestigatorCard = {
  id: 'max',
  name: 'Max',
  baseStats: {
    intelligence: 4,
    strength: 2,
    agility: 3,
  },
  health: 8,
}
const scenario = MisteryOfTheHogwartsExpress
const game = new Game(scenario, [investigator])

export default function GameUI() {
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
          {location.state.investigators.map((investigator) => (
            <div key={investigator.id} className=" text-purple-500">
              {investigator.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
