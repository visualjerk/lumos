'use client'
import { Game, Investigator, Location } from '@lumos/game'
import React from 'react'

const locations: Location[] = [
  {
    id: '1',
    name: 'Restaurant',
    incomingConnection: 'circle',
    connections: ['triangle'],
  },
  {
    id: '2',
    name: 'Gang',
    incomingConnection: 'triangle',
    connections: ['circle', 'moon', 'square'],
  },
  {
    id: '3',
    name: 'Abteil 12',
    incomingConnection: 'moon',
    connections: ['triangle'],
  },
  {
    id: '4',
    name: 'Abteil 13',
    incomingConnection: 'square',
    connections: ['triangle'],
  },
]

const investigator: Investigator = {
  name: 'Max',
  baseStats: {
    intelligence: 4,
    strength: 2,
    agility: 3,
  },
  health: 8,
}

const game = new Game()

game.addLocation(locations[0], { x: 4, y: 3 })
game.addLocation(locations[1], { x: 6, y: 3 })
game.addLocation(locations[2], { x: 5, y: 2 })
game.addLocation(locations[3], { x: 7, y: 2 })
game.addInvestigator(investigator, locations[0])

export default function GameUI() {
  return (
    <div className="grid grid-cols-10 grid-rows-6 gap-10">
      {game.layout.map(([locationId, { x, y }]) => (
        <div
          key={locationId}
          className={'w-32 h-32 bg-gray-200 flex items-center justify-center'}
          style={{ gridColumn: x, gridRow: y }}
        >
          {game.getLocation(locationId).name}
          {game.getInvestigatorAtLocation(locationId) !== null && <div>👤</div>}
        </div>
      ))}
    </div>
  )
}
