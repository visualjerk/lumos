'use client'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import {
  BoarStrength,
  ForceOfWill,
  Investigator,
  LightningStrike,
  Serenity,
} from '@lumos/game'
import React from 'react'
import { useGame } from './use-game'
import ActionButton from './action-button'

const investigator: Investigator = {
  id: 'isabel-brimble',
  name: 'Isabel Brimble',
  baseSkills: {
    intelligence: 4,
    strength: 5,
    agility: 3,
  },
  health: 8,
  baseDeck: [
    ForceOfWill.id,
    ForceOfWill.id,
    LightningStrike.id,
    LightningStrike.id,
    BoarStrength.id,
    BoarStrength.id,
    Serenity.id,
    Serenity.id,
  ],
}

export default function GameUI() {
  const { phase, parentPhase, actions } = useGame(MisteryOfTheHogwartsExpress, [
    investigator,
  ])

  return (
    <div className="max-w-screen-xl">
      <div>
        <div className="text-2xl">Phase: {phase.type}</div>
        <div>Parent Phase: {parentPhase.type}</div>
        <div>
          {actions.map((action, index) => (
            <ActionButton key={index} onClick={() => action.execute()}>
              {action.type}
            </ActionButton>
          ))}
        </div>
      </div>
    </div>
  )
}
