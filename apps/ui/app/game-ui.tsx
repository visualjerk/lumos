'use client'
import React from 'react'
import InvestigatorOverview from '@/investigator/investigator-overview'
import SkillCheckOverlay from '@/skill-check/skill-check-overlay'
import { LocationMap } from './location/location-map'
import Artwork from './shared/artwork'
import { SceneOverview } from './scene'
import { DoomOverview } from './doom'
import { EncounterOverlay } from './encounter'
import { EnemyAttackOverlay } from './enemy'

export default function GameUI() {
  return (
    <div className="h-screen flex flex-col bg-stone-400 overflow-hidden">
      <Artwork
        id="bg-table"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="relative p-4 flex gap-4 justify-center items-center">
        <DoomOverview />
        <SceneOverview />
      </div>
      <div className="flex-grow grid place-items-center">
        <LocationMap />
      </div>
      <div className="relative z-10">
        <InvestigatorOverview />
      </div>
      <SkillCheckOverlay />
      <EncounterOverlay />
      <EnemyAttackOverlay />
    </div>
  )
}
