'use client'
import React from 'react'
import ActionButton from '@/shared/action-button'
import InvestigatorOverview from '@/investigator/investigator-overview'
import SkillCheckOverlay from '@/skill-check/skill-check-overlay'
import { useGame } from './game'
import { LocationMap } from './location/location-map'

export default function GameUI() {
  const { phase, parentPhase, actions } = useGame()

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4">
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
      <div className="flex-grow">
        <LocationMap />
      </div>
      <InvestigatorOverview />
      <SkillCheckOverlay />
    </div>
  )
}
