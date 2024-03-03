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
import ActionButton from './shared/action-button'
import InvestigatorOverview from './investigator/investigator-overview'
import SkillCheckOverlay from './skill-check/skill-check-overlay'

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
  const { phase, parentPhase, actions, context } = useGame(
    MisteryOfTheHogwartsExpress,
    [investigator]
  )

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow p-4">
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
      <div>
        <InvestigatorOverview
          investigator={investigator}
          context={context}
          actions={actions}
        />
      </div>
      {(phase.type === 'skillCheck' || phase.type === 'commitSkillCheck') && (
        <SkillCheckOverlay phase={phase} actions={actions} />
      )}
    </div>
  )
}
